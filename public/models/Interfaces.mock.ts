import {
  AlertCondition,
  Detector,
  DetectorInput,
  DetectorRuleInfo,
  PeriodSchedule,
  TriggerAction,
} from '../../models/interfaces';
import { DetectorHit, DetectorResponse } from '../../server/models/interfaces';

export const detectorRuleInfoMock: DetectorRuleInfo = {
  id: 'detectorRuleId',
};

export const detectorInputMock: DetectorInput = {
  detector_input: {
    description: 'detectorDescription',
    indices: ['.windows'],
    pre_packaged_rules: [detectorRuleInfoMock],
    custom_rules: [detectorRuleInfoMock],
  },
};

export const periodScheduleMock: PeriodSchedule = {
  period: {
    interval: 1,
    unit: 'minute',
  },
};

export const triggerActionMock: TriggerAction = {
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

export const alertConditionMock: AlertCondition = {
  // Trigger fields
  name: 'alertName',

  // Detector types
  types: ['detectorType1'],

  // Trigger fields based on Rules
  sev_levels: ['low'],
  tags: ['any.tag'],
  ids: ['ruleId1'],

  // Alert related fields
  actions: [triggerActionMock, triggerActionMock],
  severity: '1',
};

export const detectorMock: Detector = {
  type: 'detector',
  detector_type: '.windows',
  name: 'detectorName',
  enabled: true,
  createdBy: 'testUser',
  schedule: periodScheduleMock,
  inputs: [detectorInputMock],
  triggers: [alertConditionMock, alertConditionMock],
};

export const detectorResponse: DetectorResponse = {
  last_update_time: 1,
  enabled_time: 1,
  ...detectorMock,
};

export const mockDetectorHit: DetectorHit = {
  _index: '.windows',
  _source: detectorResponse,
  _id: 'detectorHitId',
};

export const notificationsStart = {
  toasts: [],
};
