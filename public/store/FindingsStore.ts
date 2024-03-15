/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectorsService, FindingsService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { errorNotificationToast } from '../utils/helpers';
import { FindingItemType } from '../pages/Findings/containers/Findings/Findings';
import { FindingDetailsFlyoutBaseProps } from '../pages/Findings/components/FindingDetailsFlyout';
import { Finding, GetFindingsResponse, ServerResponse } from '../../types';

export interface IFindingsStore {
  readonly service: FindingsService;

  readonly detectorsService: DetectorsService;

  readonly notifications: NotificationsStart;

  getFinding: (findingId: string) => Promise<Finding | undefined>;

  getFindingsByIds: (findingIds: string[]) => Promise<Finding[]>;

  getFindingsPerDetector: (detectorId: string) => Promise<Finding[]>;

  getAllFindings: () => Promise<FindingItemType[]>;

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

  public getFindingsPerDetector = async (detectorId: string): Promise<Finding[]> => {
    let allFindings: Finding[] = [];
    const findingsSize = 10000;
    const firstGetFindingsRes = await this.service.getFindings({
      detector_id: detectorId,
      startIndex: 0,
      size: findingsSize,
    });

    if (firstGetFindingsRes.ok) {
      allFindings = [...firstGetFindingsRes.response.findings];
      let remainingFindings = firstGetFindingsRes.response.total_findings - findingsSize;
      let startIndex = findingsSize + 1;
      const getFindingsPromises: Promise<ServerResponse<GetFindingsResponse>>[] = [];

      while (remainingFindings > 0) {
        getFindingsPromises.push(
          this.service.getFindings({ detector_id: detectorId, startIndex, size: findingsSize })
        );
        remainingFindings -= findingsSize;
        startIndex += findingsSize;
      }

      const findingsPromisesRes = await Promise.allSettled(getFindingsPromises);

      findingsPromisesRes.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.ok) {
          allFindings = allFindings.concat(response.value.response.findings);
        }
      });
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'findings', firstGetFindingsRes.error);
    }

    return allFindings;
  };

  public getAllFindings = async (): Promise<FindingItemType[]> => {
    let allFindings: FindingItemType[] = [];
    const detectorsRes = await this.detectorsService.getDetectors();
    if (detectorsRes.ok) {
      const detectors = detectorsRes.response.hits.hits;

      for (let detector of detectors) {
        const findings = await this.getFindingsPerDetector(detector._id);
        const findingsPerDetector: FindingItemType[] = findings.map((finding) => {
          return {
            ...finding,
            detectorName: detector._source.name,
            logType: detector._source.detector_type,
            detector: detector,
            correlations: [],
          };
        });
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
}
