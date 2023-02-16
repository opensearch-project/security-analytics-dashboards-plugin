/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCondition } from '../../../../../../../models/interfaces';
import { NotificationChannelTypeOptions } from '../../../../../../../public/pages/CreateDetector/components/ConfigureAlerts/models/interfaces';
import { RuleOptions } from '../../../../../../../public/models/interfaces';
import ruleOptionsMock from '../../../../../Rules/RuleOptions.mock';
import alertConditionMock from './AlertCondition.mock';
import notificationChannelTypeOptionsMock from '../../../../../services/notifications/NotificationChannelTypeOptions.mock';
import detectorMock from '../../../../../Detectors/containers/Detectors/Detector.mock';
import AlertConditionPanel from '../../../../../../../public/pages/CreateDetector/components/ConfigureAlerts/components/AlertCondition';

const alertCondition: AlertCondition = alertConditionMock;
const notificationChannelTypeOptions: NotificationChannelTypeOptions = notificationChannelTypeOptionsMock;
const rulesOptions: RuleOptions = ruleOptionsMock;

export default ({
  alertCondition,
  allNotificationChannels: [notificationChannelTypeOptions],
  rulesOptions: [rulesOptions],
  detector: detectorMock,
  indexNum: 0,
  isEdit: false,
  hasNotificationPlugin: true,
  loadingNotifications: false,
  onAlertTriggerChanged: jest.fn(),
  refreshNotificationChannels: jest.fn(),
} as unknown) as AlertConditionPanel;
