/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { DetectorsService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CreateDetectorState } from '../pages/CreateDetector/containers/CreateDetector';
import { ICalloutProps } from '../pages/Main/components/Callout';
import { CreateDetectorResponse, ISavedObjectsService, ServerResponse } from '../../types';
import { CreateMappingsResponse } from '../../server/models/interfaces';
import { logTypesWithDashboards, ROUTES } from '../utils/constants';
import { EuiButton } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { DataStore } from './DataStore';

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
   * SavedObjectsService
   * @property {SavedObjectsService}
   * @readonly
   */
  readonly savedObjectsService: ISavedObjectsService;

  /**
   * Router history
   * @property {RouteComponentProps['history']}
   * @readonly
   */
  private history: RouteComponentProps['history'] | undefined = undefined;

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
  private invalidateCache = () => {
    this.cache = {};
    return this;
  };

  public setState = async (state: IDetectorsState, history: RouteComponentProps['history']) => {
    this.state = state;
    this.history = history;

    this.showCallout({
      title: 'Attempting to create the detector.',
      loading: true,
    });
  };

  public getState = () => (this.state ? this.state : undefined);

  public deleteState = () => {
    delete this.state;
  };

  mountToaster = (component: React.ReactElement) => (container: HTMLElement) => {
    ReactDOM.render(component, container);
    return () => ReactDOM.unmountComponentAtNode(container);
  };

  viewDetectorConfiguration = () => {
    const pendingState = DataStore.detectors.getState();
    const detectorState = pendingState?.detectorState;
    this.history?.push({
      pathname: `${ROUTES.DETECTORS_CREATE}`,
      // @ts-ignore
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

      if (!mappingsResponse.ok) {
        const error = {
          title: `Create detector failed.`,
          message: 'Double check the field mappings and try again.',
        };
        this.showCallout({
          ...error,
          closeHandler: this.showCallout,
        });

        const toast = this.notifications?.toasts.addDanger({
          title: error.title,
          text: this.mountToaster(
            <>
              <p>{error.message}</p>
              <EuiButton
                color="danger"
                onClick={() => {
                  this.hideCallout();
                  DataStore.detectors.viewDetectorConfiguration();
                  this.notifications?.toasts.remove(toast);
                }}
                size="s"
              >
                Review detector configuration
              </EuiButton>
            </>
          ),
          toastLifeTimeMs: 30000,
        });

        return Promise.resolve({
          ok: false,
          error: error,
        });
      }

      if (!detectorResponse.ok) {
        const error = {
          title: `Create detector failed.`,
          message: detectorResponse.error,
        };

        this.showCallout({
          ...error,
          closeHandler: this.showCallout,
        });

        const toast = this.notifications?.toasts.addDanger({
          title: error.title,
          text: this.mountToaster(
            <>
              <p>{error.message}</p>
              <EuiButton
                color="danger"
                onClick={() => {
                  this.hideCallout();
                  DataStore.detectors.viewDetectorConfiguration();
                  this.notifications?.toasts.remove(toast);
                }}
                size="s"
              >
                Review detector configuration
              </EuiButton>
            </>
          ),
          toastLifeTimeMs: 30000,
        });

        return Promise.resolve({
          ok: false,
          error: error,
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

      const success = {
        title: `Detector created successfully: ${detectorResponse.response.detector.name}`,
      };
      this.showCallout({
        type: 'success',
        ...success,
        closeHandler: this.showCallout,
      });

      const toast = this.notifications?.toasts.addSuccess({
        title: success.title,
        text: this.mountToaster(
          <EuiButton
            onClick={() => {
              this.hideCallout();
              DataStore.detectors.deleteState();
              this.history?.push(`${ROUTES.DETECTOR_DETAILS}/${detectorId}`);
              this.notifications?.toasts.remove(toast);
            }}
            size="s"
          >
            View detector
          </EuiButton>
        ),
        toastLifeTimeMs: 30000,
      });

      return Promise.resolve({
        detectorId: detectorId,
        dashboardId: dashboardId,
        ok: true,
      });
    }

    return Promise.resolve({ ok: false });
  };

  showNotification = (
    title: string,
    message: string,
    loading: boolean,
    type: string = 'success',
    btnText: string,
    btnHandler: () => void
  ) => {
    this.showCallout({
      type,
      title,
      message,
      closeHandler: this.showCallout,
    });
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

  showCallout = (callout?: ICalloutProps | undefined): void => {};

  hideCallout = () => this.showCallout(undefined);

  public setCalloutHandler = (calloutHandler: (callout?: ICalloutProps) => void) => {
    this.showCallout = calloutHandler;
  };
}
