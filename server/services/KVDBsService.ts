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
  CreateKVDBPayload,
  KVDBIntegrationsSearchResponse,
  KVDBResource,
  KVDBSearchRequest,
  KVDBSearchResponse,
  UpdateKVDBPayload,
} from '../../types';
import { CLIENT_KVDB_METHODS } from '../utils/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';

const KVDBS_INDEX = '.cti-kvdbs';
const INTEGRATIONS_INDEX = '.cti-integrations';

export class KVDBsService extends MDSEnabledClientService {
  searchKVDBs = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, KVDBSearchRequest>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<KVDBSearchResponse> | ResponseError>> => {
    try {
      const body = request.body ?? { query: { match_all: {} } };
      const client = this.getClient(request, context);
      const searchResponse: KVDBSearchResponse = await client('search', {
        index: KVDBS_INDEX,
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
      console.error('Security Analytics - KVDBsService - searchKVDBs:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  searchIntegrations = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, { kvdbIds: string[] }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<KVDBIntegrationsSearchResponse> | ResponseError>
  > => {
    try {
      const { kvdbIds } = request.body ?? { kvdbIds: [] };
      if (!kvdbIds.length) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { hits: { hits: [] } },
          },
        });
      }

      const client = this.getClient(request, context);
      const searchResponse: KVDBIntegrationsSearchResponse = await client('search', {
        index: INTEGRATIONS_INDEX,
        body: JSON.stringify({
          size: kvdbIds.length,
          query: {
            terms: {
              'document.kvdbs': kvdbIds,
            },
          },
        }),
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchResponse,
        },
      });
    } catch (error) {
      console.error('Security Analytics - KVDBsService - searchIntegrations:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  createKVDB = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<{ id: string }> | ResponseError>> => {
    try {
      const body = request.body as CreateKVDBPayload;
      const client = this.getClient(request, context);

      const { resource, integrationId } = body;
      if (!resource) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'KVDB resource is required',
          },
        });
      }

      const createBody = {
        body: {
          resource,
          integration: integrationId,
        },
      };

      const createResponse = await client(CLIENT_KVDB_METHODS.CREATE_KVDB, createBody);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createResponse,
        },
      });
    } catch (error) {
      console.error('Security Analytics - KVDBsService - createKVDB:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body?.message || error.message,
        },
      });
    }
  };

  updateKVDB = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ kvdbId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<null> | ResponseError>> => {
    try {
      const { kvdbId } = request.params;
      const body = request.body as UpdateKVDBPayload;
      const client = this.getClient(request, context);

      const { resource } = body;
      if (!resource) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'KVDB resource is required',
          },
        });
      }

      const updateBody = {
        body: {
          resource,
        },
        kvdbId: kvdbId,
      };

      const updateResponse = await client(CLIENT_KVDB_METHODS.UPDATE_KVDB, updateBody);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: updateResponse,
        },
      });
    } catch (error) {
      console.error('Security Analytics - KVDBsService - updateKVDB:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body?.message || error.message,
        },
      });
    }
  };

  deleteKVDB = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ kvdbId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<null> | ResponseError>> => {
    try {
      const { kvdbId } = request.params;
      const client = this.getClient(request, context);

      const deleteBody = { kvdbId };

      await client(CLIENT_KVDB_METHODS.DELETE_KVDB, deleteBody);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: null,
        },
      });
    } catch (error) {
      console.error('Security Analytics - KVDBsService - deleteKVDB:', error);
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
