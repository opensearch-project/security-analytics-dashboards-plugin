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
import { GetIndicesResponse } from '../models/interfaces';
import { ServerResponse } from '../models/types';

export default class IndexService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend POST Detectors API.
   */
  getIndices = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetIndicesResponse> | ResponseError>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const params = {
        format: 'json',
      };
      const getIndicesResponse = await callWithRequest('cat.indices', params);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            indices: getIndicesResponse,
          },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IndexService - getIndices:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  updateAliases = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetIndicesResponse> | ResponseError>> => {
    try {
      const actions = request.body;
      const params = { body: actions };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      await callWithRequest('indices.updateAliases', params);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IndexService - createAliases:', error);
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
