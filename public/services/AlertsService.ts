/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { GetAlertsParams, GetAlertsResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';

export default class AlertsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getAlerts = async (
    detectorParams: GetAlertsParams
  ): Promise<ServerResponse<GetAlertsResponse>> => {
    const { detectorType, detectorId } = detectorParams;
    let query: GetAlertsParams | {} = {};

    if (detectorId) {
      query = {
        detectorId,
      };
    } else if (detectorType) {
      query = {
        detectorType,
      };
    }

    return await this.httpClient.get(`..${API.GET_ALERTS}`, { query });
  };
}
