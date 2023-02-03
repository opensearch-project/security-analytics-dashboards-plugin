/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import services from '../../../services';
import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
const { notificationsService, detectorService, openSearchService, ruleService } = services;

export default {
  detectorHit: detectorHitMock,
  detectorService: detectorService,
  opensearchService: openSearchService,
  ruleService: ruleService,
  notificationsService: notificationsService,
  notifications: notificationsStartMock,
  location: {
    state: {
      detectorHit: detectorHitMock,
    },
  },
};
