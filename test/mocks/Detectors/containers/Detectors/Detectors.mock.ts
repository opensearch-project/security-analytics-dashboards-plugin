/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Detector,
  DetectorInput,
  DetectorRuleInfo,
  PeriodSchedule,
} from '../../../../../models/interfaces';
import { DetectorHit, DetectorResponse } from '../../../../../server/models/interfaces';
import { DetectorsService } from '../../../../../public/services';
import { mockAlertCondition } from '../AlertTriggersView/AlertTriggersView.mock';
import _ from 'lodash';
import { mockNotificationsStart } from '../../../browserServicesMock';

export const mockPeriodSchedule: PeriodSchedule = {
  period: {
    interval: 1,
    unit: 'minute',
  },
};

export const mockDetectorRuleInfo: DetectorRuleInfo = {
  id: 'detectorRuleId',
};

export const mockDetectorInput: DetectorInput = {
  detector_input: {
    description: 'detectorDescription',
    indices: ['.windows'],
    pre_packaged_rules: [mockDetectorRuleInfo],
    custom_rules: [mockDetectorRuleInfo],
  },
};

export const mockDetector: Detector = {
  type: 'detector',
  detector_type: '.windows',
  name: 'detectorName',
  enabled: true,
  createdBy: 'testUser',
  schedule: mockPeriodSchedule,
  inputs: [mockDetectorInput],
  triggers: _.times(2, (index) => {
    return {
      ...mockAlertCondition,
      id: `triggerId_${index}`,
    };
  }),
};

export const mockDetectorResponse: DetectorResponse = {
  last_update_time: 1,
  enabled_time: 1,
  ...mockDetector,
};

export const mockDetectorHit: DetectorHit = {
  _index: '.windows',
  _source: mockDetectorResponse,
  _id: 'detectorHitId',
};

export const mockDetectorService: DetectorsService = {
  getDetectors: () => {
    return {
      ok: true,
      response: {
        hits: {
          hits: [mockDetectorHit],
        },
      },
    };
  },
};

export default {
  detectorService: mockDetectorService,
  notifications: mockNotificationsStart,
};
