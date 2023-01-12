/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from './ServerResponse';
import {
  CreateMappingsResponse,
  FieldMapping,
  GetFieldMappingViewResponse,
  GetMappingsResponse,
} from '../FieldMapping';

export interface IFieldMappingService {
  getMappingsView(
    indexName: string,
    ruleTopic?: string
  ): Promise<ServerResponse<GetFieldMappingViewResponse>>;
  createMappings(
    index_name: string,
    rule_topic: string,
    fieldMappings: FieldMapping[]
  ): Promise<ServerResponse<CreateMappingsResponse>>;
  getMappings(indexName: string): Promise<ServerResponse<GetMappingsResponse>>;
}
