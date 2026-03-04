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
  NotificationsService,
  CorrelationService,
} from '../../services';
import AlertService from '../../services/AlertService';
import { DecodersService } from '../../services/DecodersService';
import { PoliciesService } from '../../services/PoliciesService';
import { IntegrationService } from '../../services/IntegrationService';
import WazuhRuleService from '../../services/WazuhRuleService';
import { LogTypeService } from '../../services/LogTypeService';
import MetricsService from '../../services/MetricsService';
import RulesService from '../../services/RuleService';
import ThreatIntelService from '../../services/ThreatIntelService';
import { KVDBsService } from '../../services/KVDBsService';
import { LogTestService } from '../../services/LogTestService';

export interface SecurityAnalyticsApi {
  readonly DETECTORS_BASE: string;
  readonly CORRELATION_BASE: string;
  readonly SEARCH_DETECTORS: string;
  readonly INDICES_BASE: string;
  readonly ALIASES_BASE: string;
  readonly FINDINGS_BASE: string;
  readonly GET_FINDINGS: string;
  readonly DOCUMENT_IDS_QUERY: string;
  readonly TIME_RANGE_QUERY: string;
  readonly MAPPINGS_BASE: string;
  readonly MAPPINGS_VIEW: string;
  readonly GET_ALERTS: string;
  readonly RULES_BASE: string;
  readonly CHANNELS: string;
  readonly PLUGINS: string;
  readonly NOTIFICATION_FEATURES: string;
  readonly ACKNOWLEDGE_ALERTS: string;
  readonly UPDATE_ALIASES: string;
  readonly CORRELATIONS: string;
  readonly LOGTYPE_BASE: string;
  readonly INTEGRATION_BASE: string;
  readonly POLICIES_BASE: string;
  readonly KVDBS_BASE: string;
  readonly LOG_TEST_BASE: string;
  readonly METRICS: string;
  readonly GET_CORRELATION_ALERTS: string;
  readonly ACK_CORRELATION_ALERTS: string;
  readonly THREAT_INTEL_BASE: string;
  readonly DECODERS_BASE: string;
}

export interface NodeServices {
  detectorsService: DetectorService;
  correlationService: CorrelationService;
  indexService: IndexService;
  findingsService: FindingsService;
  opensearchService: OpenSearchService;
  fieldMappingService: FieldMappingService;
  alertService: AlertService;
  rulesService: RulesService;
  notificationsService: NotificationsService;
  policiesService: PoliciesService;
  integrationService: IntegrationService;
  wazuhRulesService: WazuhRuleService;
  logTypeService: LogTypeService;
  kvdbsService: KVDBsService;
  metricsService: MetricsService;
  threatIntelService: ThreatIntelService;
  decodersService: DecodersService;
  logTestService: LogTestService;
}

export interface GetIndicesResponse {
  indices: CatIndex[];
}

export interface GetAliasesResponse {
  aliases: CatAlias[];
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

export interface CatAlias {
  alias: string;
  index: string;
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

export interface Plugin {
  component: string;
}

export * from './Detectors';
export * from './FieldMappings';
export * from './Findings';
export * from './Rules';
