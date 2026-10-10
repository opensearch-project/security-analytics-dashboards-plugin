/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { AlertsService } from '../services';
import { errorNotificationToast } from '../utils/helpers';
import { AlertResponse, Duration, GetAlertsParams, ThreatIntelAlert } from '../../types';
import { MAX_ALERTS_RESULT_WINDOW } from '../utils/constants';
import { dataSourceInfo } from '../services/utils/constants';

export type AlertsPageResult =
  { ok: true; alerts: AlertResponse[]; total: number } | { ok: false; error: any };

/**
 * Whether the backend of a data source can page, sort, filter and search the alerts of all
 * detectors. 'unknown' until the backend was asked.
 */
export type AlertsServerSideSupport = 'unknown' | 'supported' | 'unsupported';

export type AlertsServerSideSupportResult =
  { support: 'supported' | 'unsupported' } | { support: 'unknown'; error: any };

// Older backends require a detector id or type when getting alerts.
const DETECTOR_PARAM_REQUIRED_ERROR =
  'at least one of detector type or detector id needs to be passed';

const isDetectorParamRequiredError = (error: any) => {
  const message = typeof error === 'string' ? error : JSON.stringify(error ?? '');
  return message.toLowerCase().includes(DETECTOR_PARAM_REQUIRED_ERROR);
};

export class AlertsStore {
  // Known server side support per data source id
  private readonly serverSideSupport = new Map<string, 'supported' | 'unsupported'>();
  // Pending support detection per data source id
  private readonly serverSideSupportDetections = new Map<
    string,
    Promise<AlertsServerSideSupportResult>
  >();

  constructor(
    private readonly service: AlertsService,
    private readonly notifications: NotificationsStart
  ) {}

  /**
   * Whether the alerts of all detectors can be paged, sorted, filtered and searched by the backend
   * of the active data source, as far as known without making a request.
   */
  public getAlertsServerSideSupport(): AlertsServerSideSupport {
    return this.serverSideSupport.get(dataSourceInfo.activeDataSource.id) ?? 'unknown';
  }

  /**
   * Detects once per data source whether its backend supports paging, sorting, filtering and
   * searching the alerts of all detectors. While the support is unknown a single request for the
   * number of alerts of all detectors is made, without any of the params older backends reject.
   * Older backends reject it because it has no detector. Other errors leave the support unknown,
   * so it's detected again next time. Errors are returned, not shown.
   */
  public detectAlertsServerSideSupport(): Promise<AlertsServerSideSupportResult> {
    const dataSourceId = dataSourceInfo.activeDataSource.id;
    const support = this.serverSideSupport.get(dataSourceId);
    if (support) {
      return Promise.resolve({ support });
    }

    let detection = this.serverSideSupportDetections.get(dataSourceId);
    if (!detection) {
      detection = this.probeAlertsServerSideSupport(dataSourceId);
      this.serverSideSupportDetections.set(dataSourceId, detection);
    }

    return detection;
  }

  private async probeAlertsServerSideSupport(
    dataSourceId: string
  ): Promise<AlertsServerSideSupportResult> {
    let result: AlertsServerSideSupportResult;
    try {
      // Size 0 only gets the number of alerts.
      const res = await this.service.getAlerts({
        startIndex: 0,
        size: 0,
        dataSource: { id: dataSourceId },
      });
      if (res.ok) {
        result = { support: 'supported' };
      } else if (isDetectorParamRequiredError(res.error)) {
        result = { support: 'unsupported' };
      } else {
        result = { support: 'unknown', error: res.error };
      }
    } catch (error: any) {
      result = { support: 'unknown', error };
    }

    if (result.support !== 'unknown') {
      this.serverSideSupport.set(dataSourceId, result.support);
    }
    this.serverSideSupportDetections.delete(dataSourceId);

    return result;
  }

  /**
   * Gets a single page of alerts with exactly one request. Errors are returned, not shown. Only use
   * it with params other than a detector after detectAlertsServerSideSupport found the backend to
   * support them.
   */
  public async getAlertsPage(params: GetAlertsParams): Promise<AlertsPageResult> {
    const res = await this.service.getAlerts(params);

    if (res.ok) {
      const alerts = res.response.alerts ?? [];
      return { ok: true, alerts, total: res.response.total_alerts ?? alerts.length };
    }

    return { ok: false, error: res.error };
  }

  public async getAlertsByDetector(
    detectorId: string,
    detectorName: string,
    signal: AbortSignal,
    duration?: Duration,
    onPartialAlertsFetched?: (alerts: AlertResponse[]) => void,
    alertCount?: number,
    dataSource?: any
  ) {
    let allAlerts: any[] = [];
    const pageSize = alertCount ?? MAX_ALERTS_RESULT_WINDOW;
    let startIndex = 0;

    while (!signal.aborted) {
      const getAlertsRes = await this.service.getAlerts({
        detector_id: detectorId,
        startIndex,
        size: pageSize,
        startTime: duration?.startTime,
        endTime: duration?.endTime,
        dataSource,
      });

      if (signal.aborted) {
        break;
      }

      if (!getAlertsRes.ok) {
        errorNotificationToast(this.notifications, 'retrieve', 'alerts', getAlertsRes.error);
        break;
      }

      const alerts = this.extendAlerts(getAlertsRes.response.alerts, detectorId, detectorName);
      onPartialAlertsFetched?.(alerts);
      allAlerts = allAlerts.concat(alerts);
      startIndex += alerts.length;

      // A page that isn't full means there are no more alerts to fetch. The backend also rejects
      // requests where startIndex + size exceeds the max result window, so stop before crossing it.
      if (
        alerts.length === 0 ||
        alerts.length < pageSize ||
        startIndex + pageSize > MAX_ALERTS_RESULT_WINDOW
      ) {
        break;
      }
    }

    return allAlerts;
  }

  // Just grab 25 alerts for the analytics all threat alerts card once
  public async getAlertsForThreatAlertsCard(
    detectorId: string,
    detectorName: string,
    duration?: Duration,
    onPartialAlertsFetched?: (alerts: AlertResponse[]) => void,
    alertCount?: number,
    dataSource?: any
  ) {
    let allAlerts: any[] = [];
    const maxAlertsReturned = alertCount ?? 25;
    let startIndex = 0;

    const getAlertsRes = await this.service.getAlerts({
      detector_id: detectorId,
      startIndex,
      size: maxAlertsReturned,
      startTime: duration?.startTime,
      endTime: duration?.endTime,
      dataSource,
    });

    if (getAlertsRes.ok) {
      const alerts = this.extendAlerts(getAlertsRes.response.alerts, detectorId, detectorName);
      onPartialAlertsFetched?.(alerts);
      allAlerts = allAlerts.concat(alerts);
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'alerts', getAlertsRes.error);
    }
    return allAlerts;
  }

  public async getThreatIntelAlerts(
    signal: AbortSignal,
    duration: Duration,
    onPartialAlertsFetched?: (alerts: ThreatIntelAlert[]) => void
  ) {
    let allAlerts: any[] = [];
    const maxAlertsReturned = MAX_ALERTS_RESULT_WINDOW;
    let startIndex = 0;
    let alertsCount = 0;

    do {
      if (signal.aborted) {
        break;
      }

      const getAlertsRes = await this.service.getThreatIntelAlerts({
        startIndex,
        size: maxAlertsReturned,
        startTime: duration.startTime,
        endTime: duration.endTime,
      });

      if (signal.aborted) {
        break;
      }

      if (getAlertsRes.ok) {
        const alerts = getAlertsRes.response.alerts;
        onPartialAlertsFetched?.(alerts);
        allAlerts = allAlerts.concat(alerts);
        alertsCount = alerts.length;
      } else {
        alertsCount = 0;
        errorNotificationToast(this.notifications, 'retrieve', 'alerts', getAlertsRes.error);
      }

      startIndex += alertsCount;
    } while (
      // If we get 10,000 alerts as part of the previous call then there might be more alerts to fetch,
      // hence we make another call until the number of alerts is less then 10,000. The backend
      // rejects requests where startIndex + size exceeds the max result window, so stop before it.
      alertsCount === maxAlertsReturned &&
      startIndex + maxAlertsReturned <= MAX_ALERTS_RESULT_WINDOW
    );

    return allAlerts;
  }

  private extendAlerts(allAlerts: any[], detectorId: string, detectorName: string) {
    return allAlerts.map((alert) => {
      if (!alert.detector_id) {
        alert.detector_id = detectorId;
      }

      return {
        ...alert,
        detectorName: detectorName,
      };
    });
  }
}
