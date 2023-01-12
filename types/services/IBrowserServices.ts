/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IDetectorService } from './IDetectorService';
import { IFieldMappingService } from './IFieldMappingService';
import { IFindingService } from './IFindingService';
import { IIndexService } from './IIndexService';
import { IOpenSearchService } from './IOpensearchService';
import { IAlertService } from './IAlertService';
import { IRuleService } from './IRuleService';
import { INotificationService } from './INotificationService';

export interface IBrowserServices {
  detectorsService: IDetectorService;
  findingsService: IFindingService;
  indexService: IIndexService;
  opensearchService: IOpenSearchService;
  fieldMappingService: IFieldMappingService;
  alertService: IAlertService;
  ruleService: IRuleService;
  notificationsService: INotificationService;
}
