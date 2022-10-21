/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector } from '../../models/interfaces';
import DetectorService from '../services/DetectorService';
import { FindingsService, IndexService, OpenSearchService, FieldMappingService } from '../services';
import { Rules } from '../../models/interfaces';
import RulesService from '../services/ruleService';

export interface SecurityAnalyticsApi {
  readonly DETECTORS_BASE: string;
  readonly INDICES_BASE: string;
  readonly GET_FINDINGS: string;
  readonly DOCUMENT_IDS_QUERY: string;
  readonly TIME_RANGE_QUERY: string;
  readonly MAPPINGS_BASE: string;
  readonly MAPPINGS_VIEW: string;
}

export interface NodeServices {
  detectorsService: DetectorService;
  indexService: IndexService;
  findingsService: FindingsService;
  opensearchService: OpenSearchService;
  fieldMappingService: FieldMappingService;
}

export interface CreateDetectorParams {
  body: Detector;
}

export interface CreateDetectorResponse {
  _id: string;
  _version: number;
  detector: {
    detector: Detector & {
      last_update_time: number;
      monitor_id: string;
      rule_topic_index: string;
    };
  };
}

export interface DefaultHeaders {
  'Content-Type': 'application/json';
  Accept: 'application/json';
}

export interface SecurityAnalyticsApi {
  [API_ROUTE: string]: string;
}

export interface NodeServices {
  rulesService: RulesService;
}

export interface CreateRuleParams {
  body: Rules;
}

export interface GetIndicesResponse {
  indices: CatIndex[];
}

// Default _cat index response
export interface CatIndex {
  'docs.count': string;
  'docs.deleted': string;
  health: string;
  index: string;
  pri: string;
  'pri.store.size': string;
  rep: string;
  status: string;
  'store.size': string;
  uuid: string;
  data_stream: string | null;
}

export interface GetFindingsParams {
  detectorType: string;
}

export interface GetFindingsResponse {
  detector_id: string;
  total_findings: number;
  findings: Finding[];
}

export interface SearchResponse<T> {
  hits: {
    total: { value: number };
    hits: { _source: T; _id: string; _seq_no?: number; _primary_term?: number }[];
  };
}

export interface DocumentIdsQueryParams {
  index: string;
  body: string;
}

export interface TimeRangeQueryParams {
  index: string;
  body: string;
}

export interface GetFieldMapingsViewParams {
  indexName: string;
  ruleTopic?: string;
}

export interface GetFieldMappingViewResponse {
  properties: { [aliasName: string]: IndexFieldInfo };
  unmappedIndexFields: string[];
  unmappedFieldAliases: string[];
}

export interface IndexFieldInfo {
  type: 'alias';
  path: string;
}

export interface CreateRulesResponse {
  _id: string;
  _version: number;
  rules: {
    rules: Rules & {
      last_update_time: number;
      monitor_id: string;
      rule_topic_index: string;
    };
  };
}
