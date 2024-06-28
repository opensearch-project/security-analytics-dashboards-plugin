/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponseError } from '@opensearch-project/opensearch/lib/errors';
import {
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
} from 'src/core/server';
import { ServerResponse } from '../models/types';
import { CLIENT_THREAT_INTEL_METHODS } from '../utils/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';
import { ThreatIntelSourceGetHit, ThreatIntelSourceSearchHit } from '../../types';

export default class ThreatIntelService extends MDSEnabledClientService {
  addThreatIntelSource = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params: any = { body: request.body };
      const client = this.getClient(request, context);
      const { _id, source_config }: any = await client(
        CLIENT_THREAT_INTEL_METHODS.ADD_THREAT_INTEL_SOURCE,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { ...source_config, id: _id },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - addThreatIntelSource:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  updateThreatIntelSource = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ sourceId: string }, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params: any = { body: request.body, sourceId: request.params.sourceId };
      const client = this.getClient(request, context);
      const { _id, source_config }: any = await client(
        CLIENT_THREAT_INTEL_METHODS.UPDATE_THREAT_INTEL_SOURCE,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { ...source_config, id: _id },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - updateThreatIntelSource:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  getThreatIntelSource = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ sourceId: string }, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const { sourceId } = request.params;
      const client = this.getClient(request, context);
      const hit: ThreatIntelSourceGetHit = await client(
        CLIENT_THREAT_INTEL_METHODS.GET_THREAT_INTEL_SOURCE,
        {
          sourceId,
        }
      );
      const source = {
        id: hit._id,
        version: hit._version,
        ...hit.source_config,
      };
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: source,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - getThreatIntelSource:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  searchThreatIntelSources = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { body: request.body };
      const client = this.getClient(request, context);
      const searchSourcesResponse: any = await client(
        CLIENT_THREAT_INTEL_METHODS.SEARCH_THREAT_INTEL_SOURCES,
        params
      );
      const sources = searchSourcesResponse.hits.hits.map((hit: ThreatIntelSourceSearchHit) => ({
        id: hit._id,
        ...hit._source.source_config,
      }));
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: sources,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - searchThreatIntelSources:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  deleteThreatIntelSource = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ sourceId: string }, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { sourceId: request.params.sourceId };
      const client = this.getClient(request, context);
      const deleteRes: any = await client(
        CLIENT_THREAT_INTEL_METHODS.DELETE_THREAT_INTEL_SOURCE,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteRes,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - deleteThreatIntelSource:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  refreshThreatIntelSource = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ sourceId: string }, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { sourceId: request.params.sourceId };
      const client = this.getClient(request, context);
      const refreshRes: any = await client(
        CLIENT_THREAT_INTEL_METHODS.REFRESH_THREAT_INTEL_SOURCE,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: refreshRes,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - refreshThreatIntelSource:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  getThreatIntelIocs = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { feed_id: request.query.feedIds };

      const client = this.getClient(request, context);
      const getIocsResponse: any = await client(
        CLIENT_THREAT_INTEL_METHODS.GET_THREAT_INTEL_IOCS,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getIocsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - getThreatIntelIocs:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  createThreatIntelMonitor = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { body: request.body };
      const client = this.getClient(request, context);
      const createMonitorRes: any = await client(
        CLIENT_THREAT_INTEL_METHODS.CREATE_THREAT_INTEL_MONITOR,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createMonitorRes,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - createThreatIntelMonitor:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  updateThreatIntelMonitor = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ monitorId: string }, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { body: request.body, monitorId: request.params.monitorId };
      const client = this.getClient(request, context);
      const updateMonitorRes: any = await client(
        CLIENT_THREAT_INTEL_METHODS.UPDATE_THREAT_INTEL_MONITOR,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: updateMonitorRes,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - updateThreatIntelMonitor:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  searchThreatIntelMonitors = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, any>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const params = { body: request.body };
      const client = this.getClient(request, context);
      const searchMonitorsRes: any = await client(
        CLIENT_THREAT_INTEL_METHODS.SEARCH_THREAT_INTEL_MONITORS,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchMonitorsRes,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - ThreatIntelService - searchThreatIntelMonitors:', error);
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
