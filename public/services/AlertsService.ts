/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
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

export default class AlertsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

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
    } = getAlertsParams;
    const baseQuery = {
      sortOrder: sortOrder || 'desc',
      size: size || 10000,
      startIndex: startIndex || 0,
      dataSourceId: dataSourceInfo.activeDataSource.id,
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
    const { size, sortOrder, startIndex, startTime, endTime } = getAlertsParams;
    const query = {
      sortOrder: sortOrder || 'desc',
      size: size || 10000,
      startIndex: startIndex || 0,
      dataSourceId: dataSourceInfo.activeDataSource.id,
      startTime,
      endTime,
    };

    return await this.httpClient.get(`..${API.THREAT_INTEL_BASE}/alerts`, { query });
  };
}
