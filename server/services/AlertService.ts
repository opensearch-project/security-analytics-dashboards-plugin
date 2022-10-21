/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
} from 'opensearch-dashboards/server';
import { GetAlertsParams, GetAlertsResponse } from '../models/interfaces';
import { ServerResponse } from '../models/types';
import { CLIENT_ALERTS_METHODS } from '../utils/constants';

export default class AlertService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend GET Alerts API.
   */
  getAlerts = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetAlertsParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetAlertsResponse> | ResponseError>> => {
    try {
      const { detectorType, detectorId } = request.query;
      let params: GetAlertsParams;

      if (detectorId) {
        params = {
          detectorId,
        };
      } else if (detectorType) {
        params = {
          detectorType,
        };
      } else {
        throw Error(`Invalid request params: detectorId or detectorType must be specified`);
      }

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getAlertsResponse: GetAlertsResponse = await callWithRequest(
        CLIENT_ALERTS_METHODS.GET_ALERTS,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getAlertsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - FindingsService - getAlerts:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };
}
