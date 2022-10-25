/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GetFieldMapingsViewParams {
  indexName: string;
  ruleTopic?: string;
}

export interface GetFieldMappingViewResponse extends FieldMappingPropertyMap {
  unmapped_index_fields: string[];
  unmapped_field_aliases: string[];
}

export interface CreateMappingsParams {
  body: CreateMappingBody;
}

export interface CreateMappingBody {
  index_name: string;
  rule_topic: string;
  partial: boolean;
  alias_mappings: {
    properties: {
      [aliasName: string]: {
        type: string;
        path: string;
      };
    };
  };
}

export interface CreateMappingsResponse {
  acknowledged: boolean;
}

export interface GetMappingsParams {
  indexName: string;
}

export interface GetMappingsResponse {
  [indexName: string]: {
    mappings: FieldMappingPropertyMap;
  };
}

export interface IndexFieldInfo {
  type: 'alias';
  path: string;
}

export interface FieldMappingPropertyMap {
  properties: { [aliasName: string]: IndexFieldInfo };
}
