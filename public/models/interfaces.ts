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
} from '../services';
import CorrelationService from '../services/CorrelationService';

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
