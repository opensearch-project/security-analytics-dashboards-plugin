/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
  CreateIntegrationRequestBody,
  CreateIntegrationResponse,
  DeleteIntegrationParams,
  DeleteIntegrationResponse,
  GetPromoteBySpaceResponse,
  IntegrationBase,
  PromoteIntegrationRequestBody,
  PromoteIntegrationResponse,
  PromoteSpaces,
  SearchIntegrationsResponse,
  UpdateIntegrationParams,
  UpdateIntegrationResponse,
} from '../../types';
import { CLIENT_INTEGRATION_METHODS } from '../utils/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';
import { get, sortBy } from 'lodash';

const INTEGRATIONS_INDEX = '.cti-integrations';
const DECODERS_INDEX = '.cti-decoders';
const KVDBS_INDEX = '.cti-kvdbs';

export class IntegrationService extends MDSEnabledClientService {
  createIntegration = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, CreateIntegrationRequestBody>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<CreateIntegrationResponse> | ResponseError>
  > => {
    try {
      const { document } = request.body;
      const client = this.getClient(request, context);
      const createIntegrationResponse: CreateIntegrationResponse = await client(
        CLIENT_INTEGRATION_METHODS.CREATE_INTEGRATION,
        { body: { resource: document } }
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createIntegrationResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IntegrationService - createIntegration:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body || error.message,
        },
      });
    }
  };

  searchIntegrations = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchIntegrationsResponse> | ResponseError>
  > => {
    try {
      let query: any = request.body;

      const client = this.getClient(request, context);
      const searchIntegrationsResponse: SearchIntegrationsResponse = await client(
        // CLIENT_INTEGRATION_METHODS.SEARCH_INTEGRATIONS,
        'search',
        {
          index: INTEGRATIONS_INDEX,
          body: {
            size: 10000,
            query: query ?? {
              match_all: {},
            },
          },
        }
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchIntegrationsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IntegrationService - searchIntegrations:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  updateIntegration = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ integrationId: string }, unknown, IntegrationBase>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<UpdateIntegrationResponse> | ResponseError>
  > => {
    try {
      const {
        document: { id, date, modified, ...document },
      } = request.body;
      const { integrationId } = request.params;
      const params: UpdateIntegrationParams = {
        body: { resource: document },
        integrationId,
      };
      const client = this.getClient(request, context);
      const updateIntegrationResponse: UpdateIntegrationResponse = await client(
        CLIENT_INTEGRATION_METHODS.UPDATE_INTEGRATION,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: updateIntegrationResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IntegrationService - updateIntegration:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body.message || error.message,
        },
      });
    }
  };

  resolvePromoteEntity = async (
    client: any,
    promoteEntityData: { id: string }[],
    {
      index,
      space,
      nameProp,
      idProp,
    }: {
      index: string;
      space: PromoteSpaces;
      nameProp: string;
      idProp: string;
    }
  ) => {
    const ids = promoteEntityData.map(({ id }) => id.replace(/^\w_/, '')); // TODO: this removes the `d_` prefix of the ids

    // TODO: This should paginate the results
    const searchResponse: SearchIntegrationsResponse = await client('search', {
      index,
      body: {
        size: 10000,
        _source: [nameProp, idProp],
        query: {
          bool: {
            must: [
              {
                terms: {
                  [idProp]: ids,
                },
              },
              {
                term: {
                  'space.name': space,
                },
              },
            ],
          },
        },
      },
    });

    return Object.fromEntries(
      searchResponse.hits.hits.map(({ _source }) => [get(_source, idProp), get(_source, nameProp)])
    );
  };

  getPromoteBySpace = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ integrationId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetPromoteBySpaceResponse> | ResponseError>
  > => {
    try {
      const { space } = request.params;
      const params: { space: string } = { space };
      const client = this.getClient(request, context);
      const promoteSpace: PromoteIntegrationRequestBody = await client(
        CLIENT_INTEGRATION_METHODS.GET_PROMOTE_BY_SPACE,
        params
      );

      const availablePromotions = {
        integrations: {},
        decoders: {},
        kvdbs: {},
      };

      //
      if (promoteSpace.changes.integrations.length > 0) {
        availablePromotions['integrations'] = await this.resolvePromoteEntity(
          client,
          promoteSpace.changes.integrations,
          {
            index: INTEGRATIONS_INDEX,
            space,
            nameProp: 'document.title',
            idProp: 'document.id',
          }
        );
      }

      if (promoteSpace.changes.decoders.length > 0) {
        availablePromotions['decoders'] = await this.resolvePromoteEntity(
          client,
          promoteSpace.changes.decoders,
          {
            index: DECODERS_INDEX,
            space,
            nameProp: 'document.name',
            idProp: 'document.id',
          }
        );
      }

      if (promoteSpace.changes.kvdbs.length > 0) {
        availablePromotions['kvdbs'] = await this.resolvePromoteEntity(
          client,
          promoteSpace.changes.kvdbs,
          {
            index: KVDBS_INDEX,
            space,
            nameProp: 'document.title',
            idProp: 'document.id',
          }
        );
      }

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            promote: promoteSpace,
            available_promotions: availablePromotions,
          },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IntegrationService - promoteIntegration:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body || error.message,
        },
      });
    }
  };

  promoteIntegration = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ integrationId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<PromoteIntegrationResponse> | ResponseError>
  > => {
    try {
      const body = request.body;
      const params: { body: any } = { body };
      const client = this.getClient(request, context);
      const promoteIntegrationResponse: PromoteIntegrationResponse = await client(
        CLIENT_INTEGRATION_METHODS.PROMOTE_INTEGRATION,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: promoteIntegrationResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IntegrationService - promoteIntegration:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body?.message || error.message,
        },
      });
    }
  };

  deleteIntegration = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ integrationId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<DeleteIntegrationResponse> | ResponseError>
  > => {
    try {
      const { integrationId } = request.params;
      const params: DeleteIntegrationParams = { integrationId };
      const client = this.getClient(request, context);
      const deleteIntegrationResponse: DeleteIntegrationResponse = await client(
        CLIENT_INTEGRATION_METHODS.DELETE_INTEGRATION,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteIntegrationResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - IntegrationService - deleteIntegration:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body || error.message,
        },
      });
    }
  };
}
