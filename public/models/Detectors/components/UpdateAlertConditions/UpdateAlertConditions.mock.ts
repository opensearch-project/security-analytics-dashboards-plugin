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
import { mockDetectorHit, mockNotificationsStart } from '../../../Interfaces.mock';

const mockNotificationsService: NotificationsService = {
  getChannels: () => {
    return {
      ok: true,
      response: {
        channel_list: [],
      },
    };
  },
};

const mockRuleService: RuleService = {
  getRules: () => {
    return {
      ok: true,
      response: {
        hits: {
          hits: [],
        },
      },
    };
  },
};
export default {
  detectorHit: mockDetectorHit,
  detectorService: DetectorsService,
  opensearchService: OpenSearchService,
  ruleService: mockRuleService,
  notificationsService: mockNotificationsService,
  notifications: mockNotificationsStart,
  location: {
    state: {
      detectorHit: mockDetectorHit,
    },
  },
};
