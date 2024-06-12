/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectorsService, FindingsService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { errorNotificationToast } from '../utils/helpers';
import { FindingDetailsFlyoutBaseProps } from '../pages/Findings/components/FindingDetailsFlyout';
import { DetectorHit, Duration, Finding, FindingItemType, GetFindingsResponse, ServerResponse } from '../../types';

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

  getAllFindings: (signal: AbortSignal, duration?: { startTime: number; endTime: number; }, onPartialFindingsFetched?: (findings: Finding[]) => void) => Promise<FindingItemType[]>;

  setFlyoutCallback: (
    flyoutCallback: (findingFlyout: FindingDetailsFlyoutBaseProps | null) => void
  ) => void;

  openFlyout: (
    finding: FindingItemType,
    findings: FindingItemType[],
    shouldLoadAllFindings: boolean,
    backButton?: React.ReactNode
  ) => void;

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
  /**
   * Findings service instance
   *
   * @property {FindingsService} service
   * @readonly
   */
  readonly service: FindingsService;

  /**
   * Detectors service instance
   *
   * @property {DetectorsService} detectorsService
   * @readonly
   */
  readonly detectorsService: DetectorsService;

  /**
   * Notifications
   * @property {NotificationsStart}
   * @readonly
   */
  readonly notifications: NotificationsStart;

  /**
   * Router history
   * @property {RouteComponentProps['history']}
   * @readonly
   */
  history: RouteComponentProps['history'] | undefined = undefined;

  constructor(
    service: FindingsService,
    detectorsService: DetectorsService,
    notifications: NotificationsStart
  ) {
    this.service = service;
    this.detectorsService = detectorsService;
    this.notifications = notifications;
  }

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
      endTime: duration?.endTime
    }

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
          startIndex
        });

        if (signal.aborted) {
          return allFindings;
        }

        getFindingsPromises.push(
          getFindingsPromise
        );
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
          allFindings = allFindings.concat(this.extendFindings(response.value.response.findings, detector));
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
        const findings = await this.getFindingsPerDetector(detector._id, detector, signal, duration, onPartialFindingsFetched);
        const findingsPerDetector: FindingItemType[] = this.extendFindings(findings, detector);
        allFindings = allFindings.concat(findingsPerDetector);
      }
    }

    return allFindings;
  };

  public setFlyoutCallback = (
    flyoutCallback: (findingFlyout: FindingDetailsFlyoutBaseProps | null) => void
  ): void => {
    this.openFlyoutCallback = flyoutCallback;
  };

  public openFlyoutCallback = (findingFlyout: FindingDetailsFlyoutBaseProps | null) => {};

  closeFlyout = () => this.openFlyoutCallback(null);

  public openFlyout = (
    finding: FindingItemType,
    findings: FindingItemType[],
    shouldLoadAllFindings: boolean = false,
    backButton?: React.ReactNode
  ) => {
    const flyout = {
      finding,
      findings,
      shouldLoadAllFindings,
      backButton,
    } as FindingDetailsFlyoutBaseProps;
    this.openFlyoutCallback(flyout);
  };

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
