/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { AcknowledgeAlertsResponse, GetAlertsParams, GetAlertsResponse } from '../../types';
import { dataSourceInfo } from './utils/constants';

export default class AlertsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getAlerts = async (
    getAlertsParams: GetAlertsParams
  ): Promise<ServerResponse<GetAlertsResponse>> => {
    const { detectorType, detector_id, size, sortOrder, startIndex } = getAlertsParams;
    const baseQuery = {
      sortOrder: sortOrder || 'desc',
      size: size || 10000,
      startIndex: startIndex || 0,
      dataSourceId: dataSourceInfo.activeDataSource.id,
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
}
