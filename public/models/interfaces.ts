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
  SavedObjectsService,
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
  savedObjectsService: SavedObjectsService;
}

export interface RuleOptions {
  name: string;
  id: string;
  severity: string;
  tags: string[];
}

export interface GetFieldsOptions {
  pattern?: string;
  type?: string;
  params?: any;
  lookBack?: boolean;
  metaFields?: string[];
  dataSourceId?: string;
}

export interface RulesSharedState {
  page: RulesPage;
  rulesOptions: RuleOptions[];
}

export interface RulesPage {
  index: number;
}
