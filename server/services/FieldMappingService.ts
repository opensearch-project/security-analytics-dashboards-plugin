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
import { GetFieldMapingsViewParams, GetFieldMappingViewResponse } from '../models/interfaces';
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
}
