/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
  ResponseError,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import {
  FilterSearchRequest,
  FilterSearchResponse,
  CreateFilterPayload,
  UpdateFilterPayload,
  CUDFilterResponse,
} from '../../types';
import { MDSEnabledClientService } from './MDSEnabledClientService';
import { CLIENT_FILTER_METHODS } from '../utils/constants';

const FILTERS_INDEX = '.engine-filters';

export class FiltersService extends MDSEnabledClientService {
  searchFilters = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, FilterSearchRequest>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<FilterSearchResponse> | ResponseError>
  > => {
    try {
      const body = request.body ?? { query: { match_all: {} } };
      const client = this.getClient(request, context);
      const searchResponse: FilterSearchResponse = await client('search', {
        index: FILTERS_INDEX,
        body: JSON.stringify(body),
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchResponse,
        },
      });
    } catch (error) {
      console.error('Security Analytics - FiltersService - searchFilters:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  createFilter = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CUDFilterResponse> | ResponseError>> => {
    try {
      const body = request.body as CreateFilterPayload;
      const client = this.getClient(request, context);
      const createResponse = await client(CLIENT_FILTER_METHODS.CREATE_FILTER, { body });
      return response.custom({ statusCode: 200, body: { ok: true, response: createResponse } });
    } catch (error) {
      console.error('Security Analytics - FiltersService - createFilter:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error.body?.message || error.message },
      });
    }
  };

  updateFilter = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ filterId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CUDFilterResponse> | ResponseError>> => {
    try {
      const { filterId } = request.params;
      const body = request.body as UpdateFilterPayload;
      const client = this.getClient(request, context);
      const updateResponse = await client(CLIENT_FILTER_METHODS.UPDATE_FILTER, { filterId, body });
      return response.custom({ statusCode: 200, body: { ok: true, response: updateResponse } });
    } catch (error) {
      console.error('Security Analytics - FiltersService - updateFilter:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error.body?.message || error.message },
      });
    }
  };

  deleteFilter = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ filterId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CUDFilterResponse> | ResponseError>> => {
    try {
      const { filterId } = request.params;
      const client = this.getClient(request, context);
      await client(CLIENT_FILTER_METHODS.DELETE_FILTER, { filterId });
      return response.custom({ statusCode: 200, body: { ok: true, response: null } });
    } catch (error) {
      console.error('Security Analytics - FiltersService - deleteFilter:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error.message },
      });
    }
  };
}
