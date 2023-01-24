/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DetectorsService,
  NotificationsService,
  OpenSearchService,
  RuleService,
} from '../../../../services';
import { DetectorHit, DetectorResponse } from '../../../../../server/models/interfaces';
import { alertConditionMock, detectorMock } from '../../InterfacesMock.test';

const notificationsStart = {
  toasts: [],
};
const detectorResponse: DetectorResponse = {
  last_update_time: 1,
  enabled_time: 1,
  ...detectorMock,
};

const detectorHit: DetectorHit = {
  _index: '.windows',
  _source: detectorResponse,
  _id: 'detectorHitId',
};

export default {
  detectorHit: detectorHit,
  detectorService: DetectorsService,
  opensearchService: OpenSearchService,
  ruleService: RuleService,
  notificationsService: NotificationsService,
  notifications: notificationsStart,
  location: {
    state: {
      detectorHit: detectorHit,
    },
  },
};
