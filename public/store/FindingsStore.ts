/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CorrelationService,
  DetectorsService,
  FindingsService,
  IndexPatternsService,
  OpenSearchService,
} from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import {
  DetectorHit,
  Duration,
  Finding,
  FindingDetailsFlyoutProps,
  FindingItemType,
  ShowFlyoutDataType,
  GetFindingsResponse,
  ServerResponse,
  FlyoutPropsType,
  ThreatIntelFinding,
  ThreatIntelFindingDetailsFlyoutProps,
} from '../../types';
import FindingDetailsFlyout from '../pages/Findings/components/FindingDetailsFlyout';
import { ThreatIntelFindingDetailsFlyout } from '../pages/Findings/components/ThreatIntelFindingDetailsFlyout';

export interface IFindingsStore {
  readonly service: FindingsService;

  readonly detectorsService: DetectorsService;

  readonly notifications: NotificationsStart;

  getFinding: (findingId: string) => Promise<Finding | undefined>;

  getFindingsByIds: (findingIds: string[]) => Promise<Finding[]>;

  getFindingsPerDetector: (
    detectorId: string,
    detector: DetectorHit,
    signal: AbortSignal,
    duration?: Duration,
    onPartialFindingsFetched?: (findings: Finding[]) => void
  ) => Promise<Finding[]>;

  getAllFindings: (
    signal: AbortSignal,
    duration?: { startTime: number; endTime: number },
    onPartialFindingsFetched?: (findings: Finding[]) => void
  ) => Promise<FindingItemType[]>;

  setFlyoutCallback: (
    flyoutCallback: (flyoutData: ShowFlyoutDataType<FlyoutPropsType> | null) => void
  ) => void;

  openFlyout: (
    finding: FindingItemType,
    findings: FindingItemType[],
    shouldLoadAllFindings: boolean,
    backButton?: React.ReactNode
  ) => void;

  openThreatIntelFindingFlyout: (finding: ThreatIntelFinding, backButton?: React.ReactNode) => void;

  closeFlyout: () => void;
}

export interface IFindingsCache {}

/**
 * Findings store
 *
 * @class FindingsStore
 * @implements IDetectorsStore
 * @param {BrowserServices} services Uses services to make API requests
 */
export class FindingsStore implements IFindingsStore {
  constructor(
    readonly service: FindingsService,
    readonly detectorsService: DetectorsService,
    readonly notifications: NotificationsStart,
    private readonly indexPatternsService: IndexPatternsService,
    private readonly correlationService: CorrelationService,
    private readonly opensearchService: OpenSearchService
  ) {}

  public getFinding = async (findingId: string): Promise<Finding | undefined> => {
    const getFindingRes = await this.service.getFindings({ findingIds: [findingId] });

    if (getFindingRes.ok) {
      return getFindingRes.response.findings[0] || undefined;
    }
  };

  public getFindingsByIds = async (findingIds: string[]): Promise<Finding[]> => {
    const getFindingRes = await this.service.getFindings({ findingIds });

    if (getFindingRes.ok) {
      return getFindingRes.response.findings || [];
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'findings', getFindingRes.error);
    }

    return [];
  };

  public getFindingsPerDetector = async (
    detectorId: string,
    detector: DetectorHit,
    signal: AbortSignal,
    duration?: Duration,
    onPartialFindingsFetched?: (findings: FindingItemType[]) => void
  ): Promise<FindingItemType[]> => {
    let allFindings: FindingItemType[] = [];
    const findingsSize = 10000;
    const getFindingsQueryParams = {
      detector_id: detectorId,
      startIndex: 0,
      size: findingsSize,
      startTime: duration?.startTime,
      endTime: duration?.endTime,
    };

    if (signal.aborted) {
      return allFindings;
    }

    const firstGetFindingsRes = await this.service.getFindings(getFindingsQueryParams);

    if (firstGetFindingsRes.ok) {
      const extendedFindings = this.extendFindings(firstGetFindingsRes.response.findings, detector);
      onPartialFindingsFetched?.(extendedFindings);
      allFindings = [...extendedFindings];
      let remainingFindings = firstGetFindingsRes.response.total_findings - findingsSize;
      let startIndex = findingsSize + 1;
      const getFindingsPromises: Promise<ServerResponse<GetFindingsResponse>>[] = [];

      while (remainingFindings > 0) {
        if (signal.aborted) {
          return allFindings;
        }

        const getFindingsPromise = this.service.getFindings({
          ...getFindingsQueryParams,
          startIndex,
        });

        if (signal.aborted) {
          return allFindings;
        }

        getFindingsPromises.push(getFindingsPromise);
        getFindingsPromise.then((res): any => {
          if (res.ok) {
            onPartialFindingsFetched?.(this.extendFindings(res.response.findings, detector));
          }
        });
        remainingFindings -= findingsSize;
        startIndex += findingsSize;
      }

      const findingsPromisesRes = await Promise.allSettled(getFindingsPromises);

      findingsPromisesRes.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.ok) {
          allFindings = allFindings.concat(
            this.extendFindings(response.value.response.findings, detector)
          );
        }
      });
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'findings', firstGetFindingsRes.error);
    }

    return allFindings;
  };

  public getAllFindings = async (
    signal: AbortSignal,
    duration?: Duration,
    onPartialFindingsFetched?: (findings: FindingItemType[]) => void
  ): Promise<FindingItemType[]> => {
    let allFindings: FindingItemType[] = [];
    const detectorsRes = await this.detectorsService.getDetectors();
    if (detectorsRes.ok) {
      const detectors = detectorsRes.response.hits.hits;

      for (let detector of detectors) {
        const findings = await this.getFindingsPerDetector(
          detector._id,
          detector,
          signal,
          duration,
          onPartialFindingsFetched
        );
        const findingsPerDetector: FindingItemType[] = this.extendFindings(findings, detector);
        allFindings = allFindings.concat(findingsPerDetector);
      }
    }

    return allFindings;
  };

  public setFlyoutCallback = (
    flyoutCallback: (findingFlyout: ShowFlyoutDataType<FlyoutPropsType> | null) => void
  ): void => {
    this.openFlyoutCallback = flyoutCallback;
  };

  public openFlyoutCallback = (findingFlyout: ShowFlyoutDataType<FlyoutPropsType> | null) => {};

  closeFlyout = () => this.openFlyoutCallback(null);

  public openFlyout = (
    finding: FindingItemType,
    findings: FindingItemType[],
    shouldLoadAllFindings: boolean = false,
    backButton?: React.ReactNode
  ) => {
    const flyoutProps: FindingDetailsFlyoutProps = {
      finding,
      findings,
      shouldLoadAllFindings,
      backButton,
      opensearchService: this.opensearchService,
      correlationService: this.correlationService,
      indexPatternsService: this.indexPatternsService,
    };
    const flyout: ShowFlyoutDataType<FindingDetailsFlyoutProps> = {
      componentProps: flyoutProps,
      component: FindingDetailsFlyout,
    };
    this.openFlyoutCallback(flyout);
  };

  public openThreatIntelFindingFlyout(finding: ThreatIntelFinding, backButton?: React.ReactNode) {
    const flyoutData: ShowFlyoutDataType<ThreatIntelFindingDetailsFlyoutProps> = {
      component: ThreatIntelFindingDetailsFlyout,
      componentProps: {
        finding,
        backButton,
      },
    };

    this.openFlyoutCallback(flyoutData);
  }

  private extendFindings(findings: Finding[], detector: DetectorHit): FindingItemType[] {
    return findings.map((finding) => {
      return {
        ...finding,
        detectorName: detector._source.name,
        logType: detector._source.detector_type,
        detector: detector,
        correlations: [],
      };
    });
  }
}
