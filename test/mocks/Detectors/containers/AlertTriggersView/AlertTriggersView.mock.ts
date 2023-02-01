import { AlertCondition, TriggerAction } from '../../../../../models/interfaces';
import { mockDetector } from '../Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';

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

export default {
  detector: mockDetector,
  editAlertTriggers: jest.fn(),
  notifications: mockNotificationsStart,
};
