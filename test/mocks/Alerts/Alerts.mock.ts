/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import services from '../services';
import notificationsStartMock from '../services/notifications/NotificationsStart.mock';
const { alertService, detectorService, findingsService, ruleService, openSearchService } = services;

export default {
  alertService: alertService,
  detectorService: detectorService,
  findingService: findingsService,
  ruleService: ruleService,
  opensearchService: openSearchService,
  notifications: notificationsStartMock,
  match: jest.fn(),
  dateTimeFilter: {
    startTime: 'now-24h',
    endTime: 'now',
  },
  setDateTimeFilter: jest.fn(),
};
