/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FindingsService,
  IndexService,
  OpenSearchService,
  FieldMappingService,
  DetectorService,
} from '../../services';
import AlertService from '../../services/AlertService';
import { Rules } from '../../../models/interfaces';
import RulesService from '../../services/RuleService';

export interface SecurityAnalyticsApi {
  readonly DETECTORS_BASE: string;
  readonly SEARCH_DETECTORS: string;
  readonly INDICES_BASE: string;
  readonly GET_FINDINGS: string;
  readonly DOCUMENT_IDS_QUERY: string;
  readonly TIME_RANGE_QUERY: string;
  readonly MAPPINGS_BASE: string;
  readonly MAPPINGS_VIEW: string;
  readonly GET_ALERTS: string;
  readonly RULES_BASE: string;
}

export interface NodeServices {
  detectorsService: DetectorService;
  indexService: IndexService;
  findingsService: FindingsService;
  opensearchService: OpenSearchService;
  fieldMappingService: FieldMappingService;
  alertService: AlertService;
  rulesService: RulesService;
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

export interface CreateRuleParams {
  body: Rules;
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

export * from './Detectors';
export * from './FieldMappings';
export * from './Findings';
export * from './Alerts';
