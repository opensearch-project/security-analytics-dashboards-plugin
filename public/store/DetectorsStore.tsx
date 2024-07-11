/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectorsService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CreateDetectorState } from '../pages/CreateDetector/containers/CreateDetector';
import { ICalloutProps, resolveType, TCalloutColor } from '../pages/Main/components/Callout';
import { CreateDetectorResponse, ISavedObjectsService, ServerResponse } from '../../types';
import { CreateMappingsResponse } from '../../server/models/interfaces';
import { logTypesWithDashboards, ROUTES } from '../utils/constants';
import { EuiSmallButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { Toast } from '@opensearch-project/oui/src/eui_components/toast/global_toast_list';
import { RouteComponentProps } from 'react-router-dom';
import { DataStore } from './DataStore';
import { v4 as uuidv4 } from 'uuid';

export interface IDetectorsStore {
  readonly service: DetectorsService;
  readonly notifications: NotificationsStart;
  readonly savedObjectsService: ISavedObjectsService;
  readonly history: RouteComponentProps['history'] | undefined;
  setState: (state: IDetectorsState, history: RouteComponentProps['history']) => void;
  getState: () => IDetectorsState | undefined;
  deleteState: () => void;
  clearNotifications: () => void;
  resolvePendingCreationRequest: () => Promise<{
    detectorId?: string;
    dashboardId?: string;
    ok: boolean;
  }>;
  setHandlers: (
    calloutHandler: (callout?: ICalloutProps) => void,
    toastHandler: (toasts?: Toast[]) => void
  ) => void;
}

export interface IDetectorsState {
  pendingRequests: Promise<any>[];
  detectorInput: CreateDetectorState;
}

/**
 * Class is used to make detector's API calls and cache the detectors.
 * If there is a cache data requests are skipped and result is returned from the cache.
 * If cache is invalidated then the request is triggered to get a new set of data.
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
   * Store state
   * @private {IDetectorsState}
   */
  private state: IDetectorsState | undefined;

  /**
   * List of all shown toasts
   * @private
   */
  private toasts: Toast[] = [];

  constructor(
    service: DetectorsService,
    notifications: NotificationsStart,
    savedObjectsService: ISavedObjectsService
  ) {
    this.service = service;
    this.notifications = notifications;
    this.savedObjectsService = savedObjectsService;
  }

  public setState = (state: IDetectorsState, history: RouteComponentProps['history']): void => {
    this.state = state;
    this.history = history;

    this.showNotification('Attempting to create the detector.', undefined, 'primary', true);
  };

  public getState = (): IDetectorsState | undefined => (this.state ? this.state : undefined);

  public deleteState = (): void => {
    delete this.state;
  };

  public clearNotifications = (): void => {
    this.hideCallout();
    this.toasts = [];
    this.showToastCallback([]);
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

    const closeAllToasts = () => {
      this.toasts = [];
      this.showToastCallback(this.toasts);
    };

    const btn = btnText && (
      <EuiSmallButton
        color={type}
        onClick={(e: any) => {
          btnHandler && btnHandler(e);
          this.hideCallout();
          closeAllToasts();
        }}
        size="s"
      >
        {btnText}
      </EuiSmallButton>
    );

    const messageBody = (
      <EuiFlexGroup direction={'column'} alignItems={'flexStart'}>
        {message && <EuiFlexItem grow={false}>{message}</EuiFlexItem>}
        <EuiFlexItem grow={false}>{btn}</EuiFlexItem>
      </EuiFlexGroup>
    );

    this.showCalloutCallback({
      type,
      title,
      message: messageBody,
      closeHandler: this.hideCallout,
    });

    const { color, iconType } = resolveType(type);
    this.toasts.push({
      title,
      color,
      iconType,
      id: `toastsKey_${uuidv4()}`,
      text: messageBody,
    });
    this.showToastCallback(this.toasts);
  };

  private viewDetectorConfiguration = (): void => {
    const state = DataStore.detectors.getState();
    const detectorInput = { ...state?.detectorInput };
    DataStore.detectors.deleteState();

    this.history?.push({
      pathname: `${ROUTES.DETECTORS_CREATE}`,
      state: { detectorInput },
    });
  };

  public resolvePendingCreationRequest = async (): Promise<{
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
          const dashboard = await this.savedObjectsService.getDashboard(detectorId);
          if (dashboard) {
            dashboardId = dashboard.id;
          }
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
      setTimeout(() => this.hideCallout(), 3000);

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

  /**
   * A handler function that store gets from the Main component to show/hide the callout message
   * @param {ICalloutProps | undefined} callout
   */
  private showCalloutCallback = (callout?: ICalloutProps | undefined): void => {};

  private hideCallout = (): void => this.showCalloutCallback(undefined);

  /**
   * A handler function that store gets from the Main component to show/hide the toast message
   * @param {Toast[] | undefined} toasts
   */
  private showToastCallback = (toasts?: Toast[] | undefined): void => {};

  public hideToast = (removedToast: any): void => {
    this.toasts = this.toasts.filter((toast: Toast) => toast.id !== removedToast.id);
    this.showToastCallback(this.toasts);
  };

  public setHandlers = (
    calloutHandler: (callout?: ICalloutProps) => void,
    toastHandler: (toasts?: Toast[]) => void
  ): void => {
    this.showCalloutCallback = calloutHandler;
    this.showToastCallback = toastHandler;
  };
}
