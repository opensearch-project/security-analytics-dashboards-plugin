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
import {
  AcknowledgeAlertsParams,
  AcknowledgeAlertsResponse,
  GetAlertsParams,
  GetAlertsResponse,
} from '../models/interfaces';
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
      const { detectorType, detector_id } = request.query;
      let params: GetAlertsParams;

      if (detector_id) {
        params = {
          detector_id,
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
      console.error('Security Analytics - AlertService - getAlerts:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  /**
   * Calls backend POST Acknowledge Alerts API.
   */
  acknowledgeAlerts = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, AcknowledgeAlertsParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<AcknowledgeAlertsResponse> | ResponseError>
  > => {
    try {
      const { detector_id } = request.params as { detector_id: string };
      const { alerts } = request.body as { alerts: string[] };
      const body = { alerts: alerts };
      const params: AcknowledgeAlertsParams = {
        body,
        detector_id,
      };

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const acknowledgeAlertsResponse: AcknowledgeAlertsResponse = await callWithRequest(
        CLIENT_ALERTS_METHODS.ACKNOWLEDGE_ALERTS,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: acknowledgeAlertsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - AlertService - acknowledgeAlerts:', error);
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
