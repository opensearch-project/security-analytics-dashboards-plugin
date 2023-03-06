/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchService } from '../../../public/services';
import httpClientMock from './httpClient.mock';
import notificationsMock from './notifications/index';
import savedObjectsClientMock from './savedObjectsClient.mock';

import fieldMappingService from './fieldMappingService.mock';
import detectorService from './detectorService.mock';
import notificationsService from './notifications/notificationsService.mock';
import ruleService from './ruleService.mock';
import findingsService from './findingsService.mock';
import alertService from './alertService.mock';
import indexService from './indexService.mock';
import { BrowserServices } from '../../../public/models/interfaces';

const openSearchService = new OpenSearchService(httpClientMock, savedObjectsClientMock);

export default ({
  alertService,
  detectorService,
  fieldMappingService,
  findingsService,
  indexService,
  ruleService,
  notificationsService,
  httpClientMock,
  notificationsMock,
  openSearchService,
} as unknown) as BrowserServices;
