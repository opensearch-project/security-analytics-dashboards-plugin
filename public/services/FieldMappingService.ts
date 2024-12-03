/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  CreateMappingBody,
  CreateMappingsResponse,
  FieldMappingPropertyMap,
  GetFieldMappingViewResponse,
  GetMappingsResponse,
} from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { FieldMapping } from '.././../models/interfaces';
import { dataSourceInfo } from './utils/constants';

export class FieldMappingService {
  constructor(private readonly httpClient: HttpSetup) {}

  getMappingsView = async (
    indexName: string,
    ruleTopic?: string
  ): Promise<ServerResponse<GetFieldMappingViewResponse>> => {
    const url = `..${API.MAPPINGS_VIEW}`;
    const response = (await this.httpClient.get(url, {
      query: {
        indexName,
        ruleTopic,
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetFieldMappingViewResponse>;

    return response;
  };

  createMappings = async (
    indexName: string,
    ruleTopic: string,
    fieldMappings: FieldMapping[]
  ): Promise<ServerResponse<CreateMappingsResponse>> => {
    const url = `..${API.MAPPINGS_BASE}`;
    const aliasMappings: FieldMappingPropertyMap = {
      properties: {},
    };
    fieldMappings.forEach((mapping) => {
      if (mapping.ruleFieldName === mapping.indexFieldName) {
        return;
      }

      aliasMappings.properties[mapping.ruleFieldName] = {
        type: 'alias',
        path: mapping.indexFieldName,
      };
    });
    const fieldMappingPayload: CreateMappingBody = {
      index_name: indexName,
      rule_topic: ruleTopic,
      partial: true,
      alias_mappings: aliasMappings,
    };
    const params = {
      body: JSON.stringify(fieldMappingPayload),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    };

    return (await this.httpClient.post(url, params)) as ServerResponse<CreateMappingsResponse>;
  };

  getMappings = async (indexName: string): Promise<ServerResponse<GetMappingsResponse>> => {
    const url = `..${API.MAPPINGS_BASE}`;
    return (await this.httpClient.get(url, {
      query: {
        indexName,
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetMappingsResponse>;
  };

  getIndexAliasFields = async (indexName: string): Promise<ServerResponse<string[]>> => {
    const url = `..${API.MAPPINGS_BASE}/fields/${indexName}`;
    return (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<string[]>;
  };
}
