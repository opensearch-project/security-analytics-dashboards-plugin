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
  CorrelationService,
  MetricsService,
  ThreatIntelService,
} from '../services';

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
  logTypeService: LogTypeService;
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
