/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { AlertsService } from '../services';
import { errorNotificationToast } from '../utils/helpers';
import { GetAlertsResponse, ServerResponse } from '../../types';

export class AlertsStore {
  constructor(
    private readonly service: AlertsService,
    private readonly notifications: NotificationsStart
  ) {}

  public async getAlertsByDetector(detectorId: string, detectorName: string) {
    let allAlerts: any[] = [];
    const alertsSize = 10000;

    const firstGetAlertsRes = await this.service.getAlerts({
      detector_id: detectorId,
      startIndex: 0,
      size: alertsSize,
    });

    if (firstGetAlertsRes.ok) {
      allAlerts = [...firstGetAlertsRes.response.alerts];
      let remainingAlerts = firstGetAlertsRes.response.total_alerts - alertsSize;
      let startIndex = alertsSize + 1;
      const getAlertsPromises: Promise<ServerResponse<GetAlertsResponse>>[] = [];

      while (remainingAlerts > 0) {
        getAlertsPromises.push(
          this.service.getAlerts({ detector_id: detectorId, startIndex, size: alertsSize })
        );
        remainingAlerts -= alertsSize;
        startIndex += alertsSize;
      }

      const alertsPromisesRes = await Promise.allSettled(getAlertsPromises);

      alertsPromisesRes.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.ok) {
          allAlerts = allAlerts.concat(response.value.response.alerts);
        }
      });

      allAlerts = allAlerts.map((alert) => {
        if (!alert.detector_id) {
          alert.detector_id = detectorId;
        }

        return {
          ...alert,
          detectorName: detectorName,
        };
      });
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'alerts', firstGetAlertsRes.error);
    }

    return allAlerts;
  }
}
