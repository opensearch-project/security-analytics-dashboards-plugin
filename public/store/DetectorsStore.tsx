/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { DetectorsService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CreateDetectorState } from '../pages/CreateDetector/containers/CreateDetector';
import { ICalloutProps, TCalloutColor } from '../pages/Main/components/Callout';
import { CreateDetectorResponse, ISavedObjectsService, ServerResponse } from '../../types';
import { CreateMappingsResponse } from '../../server/models/interfaces';
import { logTypesWithDashboards, ROUTES } from '../utils/constants';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { DataStore } from './DataStore';

export interface IDetectorsStore {
  readonly service: DetectorsService;
  readonly notifications: NotificationsStart;
  readonly savedObjectsService: ISavedObjectsService;
  readonly history: RouteComponentProps['history'] | undefined;
  setState: (state: IDetectorsState, history: RouteComponentProps['history']) => void;
  getState: () => IDetectorsState | undefined;
  deleteState: () => void;
  getPendingState: () => Promise<{
    detectorId?: string;
    dashboardId?: string;
    ok: boolean;
  }>;
  setCalloutHandler: (calloutHandler: (callout?: ICalloutProps) => void) => void;
}

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
   * SavedObjectsService
   * @property {ISavedObjectsService}
   * @readonly
   */
  readonly savedObjectsService: ISavedObjectsService;

  /**
   * Router history
   * @property {RouteComponentProps['history']}
   * @readonly
   */
  history: RouteComponentProps['history'] | undefined = undefined;

  /**
   * Keeps detector's data cached
   *
   * @property {IDetectorsCache} cache
   */
  private cache: IDetectorsCache = {};

  /**
   * Store state
   * @private {IDetectorsState}
   */
  private state: IDetectorsState | undefined;

  constructor(
    service: DetectorsService,
    notifications: NotificationsStart,
    savedObjectsService: ISavedObjectsService
  ) {
    this.service = service;
    this.notifications = notifications;
    this.savedObjectsService = savedObjectsService;
  }

  /**
   * Invalidates all detectors data
   */
  private invalidateCache = (): DetectorsStore => {
    this.cache = {};
    return this;
  };

  public setState = (state: IDetectorsState, history: RouteComponentProps['history']): void => {
    this.state = state;
    this.history = history;

    this.showNotification('Attempting to create the detector.', undefined, 'primary', true);
  };

  public getState = (): IDetectorsState | undefined => (this.state ? this.state : undefined);

  public deleteState = (): void => {
    delete this.state;
  };

  private showNotification = (
    title: string,
    message?: string,
    type?: TCalloutColor,
    loading?: boolean,
    btnText?: string,
    btnHandler?: (e: any) => void
  ): void => {
    if (!type) type = 'primary';

    const btn = btnText ? (
      <EuiButton
        color={type}
        onClick={(e: any) => {
          btnHandler && btnHandler(e);
          this.hideCallout();
          this.notifications?.toasts.remove(toast);
        }}
        size="s"
      >
        {btnText}
      </EuiButton>
    ) : null;

    const messageBody = (
      <EuiFlexGroup direction={'column'} alignItems={'flexStart'}>
        <EuiFlexItem grow={false}>{message ? <p>{message}</p> : null}</EuiFlexItem>
        <EuiFlexItem grow={false}>{btn}</EuiFlexItem>
      </EuiFlexGroup>
    );

    this.showCallout({
      type,
      title,
      message: messageBody,
      closeHandler: this.showCallout,
    });

    let toastGenerator;
    switch (type) {
      case 'danger':
        toastGenerator = this.notifications?.toasts.addDanger;
        break;
      case 'warning':
        toastGenerator = this.notifications?.toasts.addWarning;
        break;
      case 'success':
        toastGenerator = this.notifications?.toasts.addSuccess;
        break;
      default:
        toastGenerator = this.notifications?.toasts.addInfo;
        break;
    }

    const toast = toastGenerator.bind(this.notifications?.toasts)({
      title: title,
      text: this.mountToaster(messageBody),
      toastLifeTimeMs: 5000,
    });
  };

  private mountToaster = (component: React.ReactElement) => (container: HTMLElement) => {
    ReactDOM.render(component, container);
    return () => ReactDOM.unmountComponentAtNode(container);
  };

  private viewDetectorConfiguration = (): void => {
    const pendingState = DataStore.detectors.getState();
    const detectorState = pendingState?.detectorState;
    this.history?.push({
      pathname: `${ROUTES.DETECTORS_CREATE}`,
      state: { detectorState },
    });
    DataStore.detectors.deleteState();
  };

  public getPendingState = async (): Promise<{
    detectorId?: string;
    dashboardId?: string;
    ok: boolean;
  }> => {
    if (this.state?.pendingRequests) {
      const [mappingsResponse, detectorResponse] = (await Promise.all(
        this.state?.pendingRequests
      )) as [ServerResponse<CreateMappingsResponse>, ServerResponse<CreateDetectorResponse>];

      let title: string = `Create detector failed.`;
      if (!mappingsResponse.ok) {
        const message = 'Double check the field mappings and try again.';

        this.showNotification(
          title,
          message,
          'danger',
          false,
          'Review detector configuration',
          DataStore.detectors.viewDetectorConfiguration
        );

        return Promise.resolve({
          ok: false,
          error: { title, message },
        });
      }

      if (!detectorResponse.ok) {
        this.showNotification(
          title,
          detectorResponse.error,
          'danger',
          false,
          'Review detector configuration',
          DataStore.detectors.viewDetectorConfiguration
        );

        return Promise.resolve({
          ok: false,
          error: {
            title,
            message: detectorResponse.error,
          },
        });
      }

      let dashboardId;
      const detector = detectorResponse.response.detector;
      const detectorId = detectorResponse.response._id;
      if (logTypesWithDashboards.has(detector.detector_type)) {
        const dashboardResponse = await this.createDashboard(
          detector.name,
          detector.detector_type,
          detectorId,
          detector.inputs[0].detector_input.indices
        );
        if (dashboardResponse && dashboardResponse.ok) {
          dashboardId = dashboardResponse.response.id;
        } else {
          const dashboards = await this.savedObjectsService.getDashboards();
          dashboards.some((dashboard) => {
            if (dashboard.references.findIndex((reference) => reference.id === detectorId) > -1) {
              dashboardId = dashboard.id;
              return true;
            }

            return false;
          });
        }
      }

      const goToDetectorDetails = (e: any) => {
        e.preventDefault();
        DataStore.detectors.deleteState();
        this.history?.push(`${ROUTES.DETECTOR_DETAILS}/${detectorId}`);
      };

      title = `Detector created successfully: ${detectorResponse.response.detector.name}`;
      this.showNotification(
        title,
        undefined,
        'success',
        false,
        'View detector',
        goToDetectorDetails
      );

      return Promise.resolve({
        detectorId: detectorId,
        dashboardId: dashboardId,
        ok: true,
      });
    }

    return Promise.resolve({ ok: false });
  };

  private createDashboard = (
    detectorName: string,
    logType: string,
    detectorId: string,
    inputIndices: string[]
  ) => {
    return this.savedObjectsService
      .createSavedObject(detectorName, logType, detectorId, inputIndices)
      .catch((error: any) => {
        console.error(error);
      });
  };

  private showCallout = (callout?: ICalloutProps | undefined): void => {};

  private hideCallout = (): void => this.showCallout(undefined);

  public setCalloutHandler = (calloutHandler: (callout?: ICalloutProps) => void): void => {
    this.showCallout = calloutHandler;
  };
}
