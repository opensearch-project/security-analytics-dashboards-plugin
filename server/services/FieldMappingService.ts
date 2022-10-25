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
import {
  CreateMappingBody,
  CreateMappingsParams,
  CreateMappingsResponse,
  GetFieldMapingsViewParams,
  GetFieldMappingViewResponse,
  GetMappingsParams,
  GetMappingsResponse,
} from '../models/interfaces';
import { ServerResponse } from '../models/types';
import { CLIENT_FIELD_MAPPINGS_METHODS } from '../utils/constants';

export default class FieldMappingService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend GET mappings/view API.
   */
  getMappingsView = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetFieldMappingViewResponse> | ResponseError>
  > => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const { indexName, ruleTopic } = request.query as { indexName: string; ruleTopic?: string };
      const params: GetFieldMapingsViewParams = {
        indexName,
        ruleTopic,
      };
      const getFieldMappingViewResponse = await callWithRequest(
        CLIENT_FIELD_MAPPINGS_METHODS.GET_MAPPINGS_VIEW,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getFieldMappingViewResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - FieldMappingService - getMappingsView:', error);
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
   * Calls backend GET Detector API.
   */
  createMappings = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<CreateMappingsResponse> | ResponseError>
  > => {
    try {
      const params: CreateMappingsParams = { body: request.body as CreateMappingBody };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getDetectorResponse: CreateMappingsResponse = await callWithRequest(
        CLIENT_FIELD_MAPPINGS_METHODS.CREATE_MAPPINGS,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getDetectorResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DetectorsService - getDetector:', error);
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
   * Calls backend GET mappings/view API.
   */
  getMappings = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetMappingsResponse> | ResponseError>
  > => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const { indexName } = request.query as { indexName: string };
      const params: GetMappingsParams = {
        indexName,
      };
      const getFieldMappingsResponse = await callWithRequest(
        CLIENT_FIELD_MAPPINGS_METHODS.GET_MAPPINGS,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getFieldMappingsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - FieldMappingService - getMappings:', error);
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
