import {
  AlertCondition,
  Detector,
  DetectorInput,
  DetectorRuleInfo,
  PeriodSchedule,
  TriggerAction,
} from '../../models/interfaces';
import { DetectorHit, DetectorResponse } from '../../server/models/interfaces';
import _ from 'lodash';
import { DetectorsService } from '../services';

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

export const mockPeriodSchedule: PeriodSchedule = {
  period: {
    interval: 1,
    unit: 'minute',
  },
};

export const mockTriggerAction: TriggerAction = {
  id: 'someId',
  // Id of notification channel
  destination_id: 'destinationId',
  subject_template: {
    source: 'sourceTemplate',
    lang: 'en-US',
  },
  name: 'triggerName',
  throttle_enabled: false,
  message_template: {
    source: 'messageSource',
    lang: 'en-US',
  },
  throttle: {
    unit: 'throttleUnit',
    value: 1,
  },
};

export const mockAlertCondition: AlertCondition = {
  // Trigger fields
  name: 'alertName',
  id: 'triggerId',

  // Detector types
  types: ['detectorType1'],

  // Trigger fields based on Rules
  sev_levels: ['low'],
  tags: ['any.tag'],
  ids: ['ruleId1'],

  // Alert related fields
  actions: [mockTriggerAction, mockTriggerAction],
  severity: '1',
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

export const mockNotificationsStart = {
  toasts: {
    addDanger: jest.fn(),
  },
};

export const mockHistory = {
  replace: jest.fn(),
};
