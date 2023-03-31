/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorsService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CreateDetectorState } from '../pages/CreateDetector/containers/CreateDetector';

export interface IDetectorsStore {}
export interface IDetectorsCache {}

export interface IDetectorsState {
  pendingRequests: Promise<any>[];
  detectorState: CreateDetectorState;
}

/**
 * Class is used to make detector's API calls and cache the detectors.
 * If there is a cache data requests are skipped and result is returned from the cache.
 * If cache is invalidated then the request is made to get a new set of data.
 *
 * @class DetectorsStore
 * @implements IDetectorsStore
 * @param {BrowserServices} services Uses services to make API requests
 */
export class DetectorsStore implements IDetectorsStore {
  /**
   * Rule service instance
   *
   * @property {DetectorsService} service
   * @readonly
   */
  readonly service: DetectorsService;

  /**
   * Notifications
   * @property {NotificationsStart}
   * @readonly
   */
  readonly notifications: NotificationsStart;

  /**
   * Keeps detector's data cached
   *
   * @property {IDetectorsCache} cache
   */
  private cache: IDetectorsCache = {};

  private state: IDetectorsState | undefined;

  constructor(service: DetectorsService, notifications: NotificationsStart) {
    this.service = service;
    this.notifications = notifications;
  }

  /**
   * Invalidates all detectors data
   */
  private invalidateCache = () => {
    this.cache = {};
    return this;
  };

  public setPendingState = (state: IDetectorsState) => {
    this['state'] = state;
  };

  public getPendingState = () => {
    if (!this.state) return undefined;
    return {
      ...this.state,
    };
  };

  public deletePendingState = () => {
    delete this.state;
  };
}
