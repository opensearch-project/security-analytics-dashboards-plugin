/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { AlertsService } from '../services';
import { errorNotificationToast } from '../utils/helpers';
import { AlertResponse, Duration } from '../../types';

export class AlertsStore {
  constructor(
    private readonly service: AlertsService,
    private readonly notifications: NotificationsStart
  ) {}

  public async getAlertsByDetector(
    detectorId: string, 
    detectorName: string, 
    signal: AbortSignal,
    duration: Duration,
    onPartialAlertsFetched?: (alerts: AlertResponse[]) => void
  ) {
    let allAlerts: any[] = [];
    const maxAlertsReturned = 10000;
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
        startTime: duration.startTime,
        endTime: duration.endTime
      });

      if (signal.aborted) {
        break;
      }
      
      if (getAlertsRes.ok) {
        onPartialAlertsFetched?.(getAlertsRes.response.alerts)
        allAlerts = allAlerts.concat(getAlertsRes.response.alerts);
        alertsCount = getAlertsRes.response.alerts.length;
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

    allAlerts = allAlerts.map((alert) => {
      if (!alert.detector_id) {
        alert.detector_id = detectorId;
      }

      return {
        ...alert,
        detectorName: detectorName,
      };
    });

    return allAlerts;
  }
}
