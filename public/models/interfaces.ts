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

export interface RulesSharedState {
  page: RulesPage;
  rulesOptions: {
    name: string;
    id: string;
    severity: string;
    tags: string[];
  }[];
}

export interface RulesPage {
  index: number;
}
