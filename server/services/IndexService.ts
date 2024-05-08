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
import { GetAliasesResponse, GetIndicesResponse } from '../models/interfaces';
import { ServerResponse } from '../models/types';
import { MDSEnabledClientService } from './MDSEnabledClientService';

export default class IndexService extends MDSEnabledClientService {
  getIndexFields = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, {}, { index: string }>,
    response: OpenSearchDashboardsResponseFactory
  ) => {
    try {
      const { index } = request.body;
      const client = this.getClient(request, context);
      const indexResponse = await client('indices.getFieldMapping', {
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
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetIndicesResponse> | ResponseError>> => {
    try {
      const client = this.getClient(request, context);
      const params = {
        format: 'json',
      };
      const getIndicesResponse = await client('cat.indices', params);

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
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetAliasesResponse> | ResponseError>> => {
    try {
      const client = this.getClient(request, context);
      const aliases = await client('cat.aliases', {
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
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<{}> | ResponseError>> => {
    try {
      const actions = request.body;
      const params = { body: actions };
      const client = this.getClient(request, context);
      await client('indices.updateAliases', params);

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
