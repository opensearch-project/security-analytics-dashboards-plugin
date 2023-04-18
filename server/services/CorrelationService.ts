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
  ILegacyCustomClusterClient,
} from 'opensearch-dashboards/server';
import { CLIENT_CORRELATION_METHODS } from '../utils/constants';
import { ServerResponse } from '../models/types';

export default class CorrelationService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  createCorrelationRule = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ) => {
    try {
      const params: any = { body: request.body };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const createRulesResponse = await callWithRequest(
        CLIENT_CORRELATION_METHODS.CREATE_CORRELATION_RULE,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createRulesResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - CorrelationService - createCorrelationRule:', error);
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
   * Calls backend GET correlation rules API.
   * URL /correlation/rules/_search
   */
  getCorrelationRules = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const { query } = request.body as { query: object };
      const params: any = { body: { from: 0, size: 10000, query } };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getCorrelationsResponse: any = await callWithRequest(
        CLIENT_CORRELATION_METHODS.GET_CORRELATION_RULES,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getCorrelationsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - CorrelationService - getCorrelationRules:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  deleteCorrelationRule = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ) => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deleteRuleResponse = await callWithRequest(
        CLIENT_CORRELATION_METHODS.DELETE_CORRELATION_RULE,
        request.params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteRuleResponse,
        },
      });
    } catch (error: any) {
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
