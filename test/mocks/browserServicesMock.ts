/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlertsService,
  DetectorsService,
  FieldMappingService,
  FindingsService,
  NotificationsService,
} from '../../public/services';
import httpClientMock from './httpClientMock';

const alertsService = new AlertsService(httpClientMock);
const detectorService = new DetectorsService(httpClientMock);
const fieldMappingService = new FieldMappingService(httpClientMock);
const findingsService = new FindingsService(httpClientMock);
const notificationsService = new NotificationsService(httpClientMock);
const ruleService = new RuleService(httpClientMock);

export const mockNotificationsStart = {
  toasts: {
    addDanger: jest.fn(),
  },
};

export default {
  alertsService,
  detectorService,
  fieldMappingService,
  findingsService,
  ruleService,
  notificationsService,
};
