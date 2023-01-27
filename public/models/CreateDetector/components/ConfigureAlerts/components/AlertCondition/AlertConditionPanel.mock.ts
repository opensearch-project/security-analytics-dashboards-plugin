/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCondition } from '../../../../../../../models/interfaces';
import {
  NotificationChannelOption,
  NotificationChannelTypeOptions,
} from '../../../../../../pages/CreateDetector/components/ConfigureAlerts/models/interfaces';
import { CreateDetectorRulesOptions } from '../../../../../types';
import { mockDetector, mockTriggerAction } from '../../../../../Interfaces.mock';
import { RuleOptions, RulesPage } from '../../../../../interfaces';

export const mockAlertCondition: AlertCondition = {
  // Trigger fields
  name: 'alertCondition',
  id: 'alertConditionId',

  // Detector types
  types: ['windows', 'dns'],

  // Trigger fields based on Rules
  sev_levels: ['low', 'high', 'critical'],
  tags: ['mock.tag'],
  ids: ['ruleID1', 'ruleID2'],

  // Alert related fields
  actions: [mockTriggerAction],
  severity: 'low',
};

export const mockNotificationChannelOption: NotificationChannelOption = {
  label: 'notificationChanelOptionLabel',
  value: 'notificationChanelOptionValue',
  type: 'notificationChanelOptionType',
  description: 'notificationChanelOptionDescription',
};
export const mockNotificationChannelTypeOptions: NotificationChannelTypeOptions = {
  label: 'notificationChannelLabel',
  options: [mockNotificationChannelOption],
};
export const mockRulesPage: RulesPage = {
  index: 1,
};
export const mockRuleOptions: RuleOptions = {
  name: 'RuleOptionsName',
  id: 'RuleOptionsID',
  severity: 'low',
  tags: ['mock.tag'],
};
export const mockCreateDetectorRulesOptions: CreateDetectorRulesOptions = {
  page: mockRulesPage,
  rulesOptions: [mockRuleOptions],
};

export default {
  alertCondition: mockAlertCondition,
  allNotificationChannels: [mockNotificationChannelTypeOptions],
  rulesOptions: [mockRuleOptions],
  detector: mockDetector,
  indexNum: 1,
  isEdit: false,
  hasNotificationPlugin: false,
  loadingNotifications: false,
  onAlertTriggerChanged: jest.fn(),
  refreshNotificationChannels: jest.fn(),
};
