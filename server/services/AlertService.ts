/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import { CLIENT_ALERTS_METHODS, CLIENT_THREAT_INTEL_METHODS } from '../utils/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';
import {
  AcknowledgeAlertsParams,
  AcknowledgeAlertsResponse,
  GetAlertsParams,
  GetAlertsResponse,
  GetThreatIntelAlertsParams,
} from '../../types';

export default class AlertService extends MDSEnabledClientService {
  /**
   * Calls backend GET Alerts API.
   */
  getAlerts = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetAlertsParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetAlertsResponse> | ResponseError>> => {
    try {
      const {
        detectorType,
        detector_id,
        sortOrder,
        sortString,
        size,
        startIndex,
        startTime,
        endTime,
        searchString,
        severityLevels,
        alertStates,
        paging,
        searchAfter,
        direction,
      } = request.query;
      const params: GetAlertsParams = {
        sortOrder,
        sortString,
        size,
        startIndex,
        startTime,
        endTime,
        searchString,
        severityLevels,
        alertStates,
      };

      // Cursor paging params are only sent when used, so that older backends, which reject them,
      // keep working for all other requests.
      if (paging) {
        params.paging = paging;
        if (searchAfter) {
          params.searchAfter = searchAfter;
        }
        if (direction) {
          params.direction = direction;
        }
      }

      // When neither detector_id nor detectorType is given the backend returns the alerts of all
      // detectors the user has access to. detector_id takes precedence over detectorType.
      if (detector_id) {
        params.detector_id = detector_id;
      } else if (detectorType) {
        params.detectorType = detectorType;
      }

      const client = this.getClient(request, context);
      const getAlertsResponse: GetAlertsResponse = await client(
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
    context: RequestHandlerContext,
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

      const client = this.getClient(request, context);
      const acknowledgeAlertsResponse: AcknowledgeAlertsResponse = await client(
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

  getThreatIntelAlerts = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetThreatIntelAlertsParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const { sortOrder, size, startIndex, startTime, endTime } = request.query;

      const params: any = {
        sortOrder,
        size,
        startIndex,
        startTime,
        endTime,
      };
      const client = this.getClient(request, context);
      const getAlertsResponse: GetAlertsResponse = await client(
        CLIENT_THREAT_INTEL_METHODS.GET_THREAT_INTEL_ALERTS,
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
      console.error('Security Analytics - AlertService - getThreatIntelAlerts:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  updateThreatIntelAlertsState = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<
      any,
      {
        state: 'ACKNOWLEDGED' | 'COMPLETED';
        alert_ids: string;
      }
    >,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const { state, alert_ids } = request.query;
      const params: any = { state, alert_ids };
      const client = this.getClient(request, context);

      const updateStatusResponse: GetAlertsResponse = await client(
        CLIENT_THREAT_INTEL_METHODS.UPDATE_THREAT_INTEL_ALERTS_STATE,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: updateStatusResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - AlertService - updateThreatIntelAlertsState:', error);
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
