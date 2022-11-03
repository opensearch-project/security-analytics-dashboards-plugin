/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  AcknowledgeAlertsResponse,
  GetAlertsParams,
  GetAlertsResponse,
} from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';

export default class AlertsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getAlerts = async (
    detectorParams: GetAlertsParams
  ): Promise<ServerResponse<GetAlertsResponse>> => {
    const { detectorType, detector_id } = detectorParams;
    let query: GetAlertsParams | {} = {};

    if (detector_id) {
      query = {
        detector_id,
      };
    } else if (detectorType) {
      query = {
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
    return await this.httpClient.post(`..${url}`, { body });
  };
}
