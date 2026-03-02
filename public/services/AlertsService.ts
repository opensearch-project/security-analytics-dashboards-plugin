/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup, NotificationsStart } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import {
  AcknowledgeAlertsResponse,
  GetAlertsParams,
  GetAlertsResponse,
  GetThreatIntelAlertsParams,
  GetThreatIntelAlertsResponse,
} from '../../types';
import { dataSourceInfo } from './utils/constants';
import { errorNotificationToast } from '../utils/helpers';
import { THREAT_INTEL_ENABLED } from '../utils/constants';

export default class AlertsService {
  constructor(private httpClient: HttpSetup, private notifications: NotificationsStart) {}

  getAlerts = async (
    getAlertsParams: GetAlertsParams
  ): Promise<ServerResponse<GetAlertsResponse>> => {
    const {
      detectorType,
      detector_id,
      size,
      sortOrder,
      startIndex,
      startTime,
      endTime,
      dataSource,
    } = getAlertsParams;
    const baseQuery = {
      sortOrder: sortOrder || 'desc',
      size: size || 10000,
      startIndex: startIndex || 0,
      dataSourceId: dataSource?.id || dataSourceInfo.activeDataSource.id,
      startTime,
      endTime,
    };
    let query;

    if (detector_id) {
      query = {
        ...baseQuery,
        detector_id,
      };
    } else if (detectorType) {
      query = {
        ...baseQuery,
        detectorType,
      };
    }

    return await this.httpClient.get(`..${API.GET_ALERTS}`, { query });
  };

  acknowledgeAlerts = async (
    alertIds: string[],
    detector_id: string
  ): Promise<ServerResponse<AcknowledgeAlertsResponse>> => {
    const url = API.ACKNOWLEDGE_ALERTS.replace('{detector_id}', detector_id);
    const body = JSON.stringify({ alerts: alertIds });
    return await this.httpClient.post(`..${url}`, {
      body,
      query: { dataSourceId: dataSourceInfo.activeDataSource.id },
    });
  };

  getThreatIntelAlerts = async (
    getAlertsParams: GetThreatIntelAlertsParams
  ): Promise<ServerResponse<GetThreatIntelAlertsResponse>> => {
    if (!THREAT_INTEL_ENABLED) {
      return {
        ok: true,
        response: {
          total_alerts: 0,
          alerts: [],
        },
      };
    }

    const { size, sortOrder, startIndex, startTime, endTime } = getAlertsParams;
    const query = {
      sortOrder: sortOrder || 'desc',
      size: size || 10000,
      startIndex: startIndex || 0,
      dataSourceId: dataSourceInfo.activeDataSource.id,
      startTime,
      endTime,
    };

    const res = await this.httpClient.get(`..${API.THREAT_INTEL_BASE}/alerts`, { query });

    if (!res.ok) {
      errorNotificationToast(this.notifications, 'get', 'alerts', res.error);
    }

    return res;
  };

  updateThreatIntelAlertsState = async (
    state: 'ACKNOWLEDGED' | 'COMPLETED',
    alertIds: string[]
  ): Promise<ServerResponse<AcknowledgeAlertsResponse>> => {
    if (!THREAT_INTEL_ENABLED) {
      return { ok: true, response: {} };
    }

    const url = `${API.THREAT_INTEL_BASE}/alerts/status`;
    return await this.httpClient.put(`..${url}`, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
        state,
        alert_ids: alertIds.join(','),
      },
    });
  };
}
