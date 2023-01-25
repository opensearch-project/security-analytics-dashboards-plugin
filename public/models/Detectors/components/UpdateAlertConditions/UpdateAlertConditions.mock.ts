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
import { mockDetectorHit, notificationsStart } from '../../../Interfaces.mock';

const notificationsService: NotificationsService = {
  getChannels: () => {
    return {
      ok: true,
      response: {
        channel_list: [],
      },
    };
  },
};

const ruleService: RuleService = {
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
  ruleService: ruleService,
  notificationsService: notificationsService,
  notifications: notificationsStart,
  location: {
    state: {
      detectorHit: mockDetectorHit,
    },
  },
};
