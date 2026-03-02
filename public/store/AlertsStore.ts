/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { AlertsService } from '../services';
import { errorNotificationToast } from '../utils/helpers';
import { AlertResponse, Duration, ThreatIntelAlert } from '../../types';
import { THREAT_INTEL_ENABLED } from '../utils/constants';

export class AlertsStore {
  constructor(
    private readonly service: AlertsService,
    private readonly notifications: NotificationsStart
  ) {}

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
    const maxAlertsReturned = alertCount ?? 10000;
    let startIndex = 0;
    let alertsCount = 0;

    do {
      if (signal.aborted) {
        break;
      }

      const getAlertsRes = await this.service.getAlerts({
        detector_id: detectorId,
        startIndex,
        size: maxAlertsReturned,
        startTime: duration?.startTime,
        endTime: duration?.endTime,
        dataSource,
      });

      if (signal.aborted) {
        break;
      }

      if (getAlertsRes.ok) {
        const alerts = this.extendAlerts(getAlertsRes.response.alerts, detectorId, detectorName);
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
      // hence we make another call until the number of alerts is less then 10,000
      alertsCount === maxAlertsReturned
    );

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
    if (!THREAT_INTEL_ENABLED) {
      return [];
    }

    let allAlerts: any[] = [];
    const maxAlertsReturned = 10000;
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
      // hence we make another call until the number of alerts is less then 10,000
      alertsCount === maxAlertsReturned
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
