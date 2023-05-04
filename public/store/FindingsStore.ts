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

export interface IFindingsStore {
  readonly service: FindingsService;

  readonly detectorsService: DetectorsService;

  readonly notifications: NotificationsStart;

  getFindingsPerDetector: (detectorId: string) => Promise<FindingItemType[]>;

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

  public getFindingsPerDetector = async (detectorId: string): Promise<FindingItemType[]> => {
    let allFindings: FindingItemType[] = [];
    const findingRes = await this.service.getFindings({ detectorId });
    if (findingRes.ok) {
      allFindings = findingRes.response.findings as FindingItemType[];
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'findings', findingRes.error);
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
    shouldLoadAllFindings: boolean,
    backButton?: React.ReactNode
  ) => {
    const flyout = {
      finding,
      findings,
      shouldLoadAllFindings,
      backButton,
    } as FindingDetailsFlyoutBaseProps;
    console.log('FIND DATA', flyout);
    this.openFlyoutCallback(flyout);
  };
}
