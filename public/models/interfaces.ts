/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DetectorsService,
  FindingsService,
  OpenSearchService,
  FieldMappingService,
  AlertsService,
  IndexService,
  RuleService,
  NotificationsService,
} from '../services';

export interface BrowserServices {
  detectorsService: DetectorsService;
  findingsService: FindingsService;
  indexService: IndexService;
  opensearchService: OpenSearchService;
  fieldMappingService: FieldMappingService;
  alertService: AlertsService;
  ruleService: RuleService;
  notificationsService: NotificationsService;
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
