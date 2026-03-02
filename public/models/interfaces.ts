/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ISavedObjectsService } from '../../types';
import {
  DetectorsService,
  FindingsService,
  OpenSearchService,
  FieldMappingService,
  AlertsService,
  IndexService,
  RuleService,
  NotificationsService,
  IndexPatternsService,
  LogTypeService,
  IntegrationService,
  PoliciesService,
  DecodersService,
  KVDBsService,
} from '../services';
import CorrelationService from '../services/CorrelationService';
import LogTestService from '../services/LogTestService';
import MetricsService from '../services/MetricsService';
import ThreatIntelService from '../services/ThreatIntelService';

export interface BrowserServices {
  detectorsService: DetectorsService;
  correlationsService: CorrelationService;
  findingsService: FindingsService;
  indexService: IndexService;
  opensearchService: OpenSearchService;
  fieldMappingService: FieldMappingService;
  alertService: AlertsService;
  ruleService: RuleService;
  notificationsService: NotificationsService;
  savedObjectsService: ISavedObjectsService;
  indexPatternsService: IndexPatternsService;
  integrationService: IntegrationService;
  policiesService: PoliciesService;
  logTypeService: LogTypeService;
  decodersService: DecodersService;
  kvdbsService: KVDBsService;
  logTestService: LogTestService;
  metricsService: MetricsService;
  threatIntelService: ThreatIntelService;
}

export interface RuleOptions {
  name: string;
  id: string;
  severity: string;
  tags: string[];
}

export interface RulesSharedState {
  page: RulesPage;
  rulesOptions: RuleOptions[];
}

export interface RulesPage {
  index: number;
}
