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
  ILegacyCustomClusterClient,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import { DecoderItem, GetDecoderResponse, SearchDecodersResponse } from '../../types';
import { CLIENT_DECODER_METHODS } from '../utils/constants';

const DECODERS_INDEX = '.cti-decoders';
const INTEGRATIONS_INDEX = '.cti-integrations';
const SPACE_FIELD_CANDIDATES = [
  'space.keyword',
  'space',
  'space.name.keyword',
  'space.name',
  'document.space.keyword',
  'document.space',
  'document.space.name.keyword',
  'document.space.name',
];

interface SpaceFieldCaps {
  searchFields: string[];
  aggFields: string[];
}

export class DecodersService {
  constructor(private osDriver: ILegacyCustomClusterClient) {}

  private spaceFieldCaps?: SpaceFieldCaps;
  private spaceFieldCapsPromise?: Promise<SpaceFieldCaps>;

  private getClient(request: OpenSearchDashboardsRequest) {
    return this.osDriver.asScoped(request).callAsCurrentUser;
  }

  private async getSpaceFieldCaps(client: any): Promise<SpaceFieldCaps> {
    if (this.spaceFieldCaps) {
      return this.spaceFieldCaps;
    }

    if (!this.spaceFieldCapsPromise) {
      this.spaceFieldCapsPromise = (async () => {
        try {
          const fieldCapsResponse = await client('fieldCaps', {
            index: DECODERS_INDEX,
            fields: SPACE_FIELD_CANDIDATES,
          });
          const fields = fieldCapsResponse?.fields ?? {};
          const searchFields: string[] = [];
          const aggFields: string[] = [];
          SPACE_FIELD_CANDIDATES.forEach((field) => {
            const types = fields[field];
            if (!types) {
              return;
            }
            const entries = Object.entries(types) as Array<
              [string, { searchable?: boolean; aggregatable?: boolean }]
            >;
            const isSearchable = entries.some(
              ([type, meta]) => meta?.searchable && type !== 'object' && type !== 'nested'
            );
            const isAggregatable = entries.some(
              ([type, meta]) => meta?.aggregatable && type !== 'object' && type !== 'nested'
            );
            if (isSearchable) {
              searchFields.push(field);
            }
            if (isAggregatable) {
              aggFields.push(field);
            }
          });

          const result = {
            searchFields: searchFields.length ? searchFields : SPACE_FIELD_CANDIDATES,
            aggFields: aggFields.length ? aggFields : SPACE_FIELD_CANDIDATES,
          };
          this.spaceFieldCaps = result;
          return result;
        } catch (error: any) {
          console.warn('Security Analytics - DecodersService - fieldCaps:', error?.message);
        }

        const fallback = {
          searchFields: SPACE_FIELD_CANDIDATES,
          aggFields: SPACE_FIELD_CANDIDATES,
        };
        this.spaceFieldCaps = fallback;
        return fallback;
      })();
    }

    return this.spaceFieldCapsPromise;
  }

  private buildSpaceFilter(space: string, fields: string[]) {
    return {
      bool: {
        should: fields.map((field) => ({ term: { [field]: space } })),
        minimum_should_match: 1,
      },
    };
  }

  private applySpaceFilter(query: any, space: string | undefined, fields: string[]) {
    if (!space) {
      return query ?? { match_all: {} };
    }

    const spaceFilter = this.buildSpaceFilter(space, fields);

    if (!query || Object.keys(query).length === 0) {
      return { bool: { filter: [spaceFilter] } };
    }

    if (query.bool) {
      const { filter, ...restBool } = query.bool;
      const existingFilter = Array.isArray(filter) ? filter : filter ? [filter] : [];
      return {
        bool: {
          ...restBool,
          filter: [...existingFilter, spaceFilter],
        },
      };
    }

    return {
      bool: {
        must: [query],
        filter: [spaceFilter],
      },
    };
  }

  private async fetchIntegrationMap(client: any, decoderIds: string[]) {
    const integrations = new Map<string, string[]>();

    if (!decoderIds.length) {
      return integrations;
    }

    try {
      const integrationResponse = await client('search', {
        index: INTEGRATIONS_INDEX,
        body: {
          size: 10000,
          query: {
            terms: {
              'document.decoders': decoderIds,
            },
          },
          _source: ['document.title', 'document.decoders'],
        },
      });

      const hits = integrationResponse?.hits?.hits ?? [];
      hits.forEach((hit: any) => {
        const title = hit?._source?.document?.title;
        const decoderRefs = hit?._source?.document?.decoders;
        const decoderList = Array.isArray(decoderRefs)
          ? decoderRefs
          : decoderRefs
          ? [decoderRefs]
          : [];
        decoderList.forEach((decoderId: string) => {
          if (!integrations.has(decoderId)) {
            integrations.set(decoderId, []);
          }
          if (title && !integrations.get(decoderId)!.includes(title)) {
            integrations.get(decoderId)!.push(title);
          }
        });
      });
    } catch (error: any) {
      console.warn('Security Analytics - DecodersService - fetchIntegrationMap:', error?.message);
    }

    return integrations;
  }

  searchDecoders = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchDecodersResponse> | ResponseError>
  > => {
    try {
      const body = (request.body as any) ?? {};
      const space = (request.query as { space?: string })?.space;
      const { from = 0, size = 25, sort, query, _source } = body;

      const client = this.getClient(request);
      const { searchFields } = await this.getSpaceFieldCaps(client);
      const searchResponse = await client('search', {
        index: DECODERS_INDEX,
        body: {
          from,
          size,
          sort,
          track_total_hits: true,
          _source: _source === undefined ? { includes: ['document', 'space'] } : _source,
          query: this.applySpaceFilter(query, space, searchFields),
        },
      });

      const hits = searchResponse?.hits?.hits ?? [];
      const decoderIds = hits.map((hit: any) => hit._id);
      const integrationMap = await this.fetchIntegrationMap(client, decoderIds);
      const items: DecoderItem[] = hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        integrations: integrationMap.get(hit._id) ?? [],
      }));
      const total =
        typeof searchResponse?.hits?.total === 'number'
          ? searchResponse.hits.total
          : searchResponse?.hits?.total?.value ?? items.length;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            total,
            items,
          },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DecodersService - searchDecoders:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  getDecoder = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ decoderId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetDecoderResponse> | ResponseError>> => {
    try {
      const { decoderId } = request.params;
      const space = (request.query as { space?: string })?.space;
      const client = this.getClient(request);
      const { searchFields } = await this.getSpaceFieldCaps(client);
      const searchResponse = await client('search', {
        index: DECODERS_INDEX,
        body: {
          size: 1,
          query: this.applySpaceFilter({ ids: { values: [decoderId] } }, space, searchFields),
        },
      });

      const hit = searchResponse?.hits?.hits?.[0];
      if (!hit) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'Decoder not found',
          },
        });
      }

      const integrationMap = await this.fetchIntegrationMap(client, [hit._id]);
      const item: DecoderItem = {
        id: hit._id,
        ...hit._source,
        integrations: integrationMap.get(hit._id) ?? [],
      };

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            item,
          },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DecodersService - getDecoder:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  createDecoder = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<{ id: string }> | ResponseError>> => {
    try {
      const body = request.body as { document: any; integrationId: string };
      const client = this.getClient(request);

      const { document: decoderDocument, integrationId } = body;
      if (!decoderDocument) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'Decoder document is required',
          },
        });
      }

      const createBody = {
        body: {
          resource: decoderDocument,
          integration: integrationId,
        },
      };

      const createResponse = await client(CLIENT_DECODER_METHODS.CREATE_DECODER, createBody);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DecodersService - createDecoder:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body.message || error.message,
        },
      });
    }
  };

  updateDecoder = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ decoderId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<null> | ResponseError>> => {
    try {
      const { decoderId } = request.params;
      const body = request.body as { document: any };
      const client = this.getClient(request);

      const { document: decoderDocument } = body;
      if (!decoderDocument) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'Decoder document is required',
          },
        });
      }

      const updateBody = {
        body: {
          resource: decoderDocument,
        },
        decoderId: decoderId,
      };

      const responseRequest = await client(CLIENT_DECODER_METHODS.UPDATE_DECODER, updateBody);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: responseRequest,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DecodersService - updateDecoder:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.body.message || error.message,
        },
      });
    }
  };

  deleteDecoder = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ decoderId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<null> | ResponseError>> => {
    try {
      const { decoderId } = request.params;
      const client = this.getClient(request);

      const deleteBody = { decoderId };

      await client(CLIENT_DECODER_METHODS.DELETE_DECODER, deleteBody);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: null,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DecodersService - deleteDecoder:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  getDraftIntegrations = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const client = this.getClient(request);
      const searchResponse = await client('search', {
        index: INTEGRATIONS_INDEX,
        body: {
          size: 10000,
          query: {
            term: {
              'space.name': {
                value: 'draft',
              },
            },
          },
          _source: true,
        },
      });

      const hits = searchResponse?.hits?.hits ?? [];

      const total = hits.length;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            total,
            items: hits,
          },
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DecodersService - getDraftIntegrations:', error);
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
