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
import { GetAliasesResponse, GetIndicesResponse } from '../models/interfaces';
import { ServerResponse } from '../models/types';

export default class IndexService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  getIndexFields = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, {}, { index: string }>,
    response: OpenSearchDashboardsResponseFactory
  ) => {
    try {
      const { index } = request.body;
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const indexResponse = await callWithRequest('indices.getFieldMapping', {
        index,
        fields: ['*'],
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: Object.keys(indexResponse[index]?.mappings || {}),
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

  getAliases = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetAliasesResponse> | ResponseError>> => {
    try {
      const { callAsCurrentUser } = this.osDriver.asScoped(request);
      const aliases = await callAsCurrentUser('cat.aliases', {
        format: 'json',
        h: 'alias,index',
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            aliases,
          },
        },
      });
    } catch (err: any) {
      console.error('Security Analytcis - IndexService - getAliases:', err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  updateAliases = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<{}> | ResponseError>> => {
    try {
      const actions = request.body;
      const params = { body: actions };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      await callWithRequest('indices.updateAliases', params);

      return response.custom({
        statusCode: 200,
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
