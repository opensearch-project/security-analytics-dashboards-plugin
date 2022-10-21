/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
  ResponseError,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import { DocumentIdsQueryParams, SearchResponse, TimeRangeQueryParams } from '../models/interfaces';

export default class OpenSearchService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Searches the provided index for documents with the provided IDs.
   */
  documentIdsQuery = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchResponse<any>> | ResponseError>
  > => {
    try {
      const { index, documentIds } = request.query as { index: string; documentIds: string[] };
      const body = {
        query: {
          terms: {
            _id: documentIds,
          },
        },
      };
      const params: DocumentIdsQueryParams = { index, body: JSON.stringify(body) };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const searchResponse: SearchResponse<any> = await callWithRequest('search', params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - OpenSearchService - documentIdsQuery:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  timeRangeQuery = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchResponse<any>> | ResponseError>
  > => {
    try {
      const {
        index,
        timeField = 'timestamp',
        startTime = 'now-15m',
        endTime = 'now',
      } = request.query as {
        index: string;
        timeField: string;
        startTime: string;
        endTime: string;
      };

      const body = {
        query: {
          range: {
            [timeField]: {
              gte: startTime,
              lt: endTime,
            },
          },
        },
      };

      const params: TimeRangeQueryParams = { index, body: JSON.stringify(body) };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const searchResponse: SearchResponse<any> = await callWithRequest('search', params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - OpenSearchService - timeRangeQuery:', error);
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
