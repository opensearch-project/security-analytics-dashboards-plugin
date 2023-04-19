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
import {
  GetAllCorrelationsInTimeRangeResponse,
  GetCorrelationFindingsParams,
  GetCorrelationFindingsResponse,
  SearchCorrelationRulesResponse,
} from '../../types';

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
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchCorrelationRulesResponse> | ResponseError>
  > => {
    try {
      const { query } = request.body as { query: object };
      const params: any = { body: { from: 0, size: 10000, query } };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getCorrelationsResponse: SearchCorrelationRulesResponse = await callWithRequest(
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
    request: OpenSearchDashboardsRequest<{}, GetCorrelationFindingsParams>,
    response: OpenSearchDashboardsResponseFactory
  ) => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deleteCorrelationRuleResponse = await callWithRequest(
        CLIENT_CORRELATION_METHODS.DELETE_CORRELATION_RULE,
        request.params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteCorrelationRuleResponse,
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

  getCorrelatedFindings = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetCorrelationFindingsResponse> | ResponseError>
  > => {
    try {
      const { finding, detector_type, nearby_findings = 20 } = request.query;
      const params: any = { finding, detector_type, nearby_findings };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getCorrelationFindingsResponse: GetCorrelationFindingsResponse = await callWithRequest(
        CLIENT_CORRELATION_METHODS.GET_CORRELATED_FINDINGS,
        params
      );
      // const getCorrelationFindingsResponse: GetCorrelationFindingsResponse = {
      //   findings: [
      //     {
      //       finding: 'bce7680d-cce1-4ce3-9499-18b49ff405f9',
      //       detector_type: 'dns',
      //       score: 0.00001632626481296029,
      //     },
      //   ],
      // };

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getCorrelationFindingsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - CorrelationService - getCorrelatedFindings:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  getAllCorrelationsInTimeRange = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<
      ServerResponse<GetAllCorrelationsInTimeRangeResponse> | ResponseError
    >
  > => {
    try {
      const { start_timestamp, end_timestamp } = request.query;
      console.log(request.query);
      const params: any = { start_timestamp, end_timestamp };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getCorrelationsResponse: GetAllCorrelationsInTimeRangeResponse = await callWithRequest(
        CLIENT_CORRELATION_METHODS.GET_ALL_CORRELATIONS,
        params
      );
      // const getCorrelationsResponse: GetAllCorrelationsInTimeRangeResponse = {
      //   findings: [
      //     {
      //       finding1: 'bce7680d-cce1-4ce3-9499-18b49ff405f9',
      //       logType1: 'dns',
      //       finding2: '5fe4a9c1-b1ca-4085-9291-85dccd8c8e11',
      //       logType2: 'network',
      //     },
      //   ],
      // };

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getCorrelationsResponse,
        },
      });
    } catch (error: any) {
      console.error(
        'Security Analytics - CorrelationService - getAllCorrelationsInTimeRange:',
        error
      );
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
