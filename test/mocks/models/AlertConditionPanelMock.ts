/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCondition, Detector } from "../../../models/interfaces";
import { modelsMock } from '../';
import {
  NotificationChannelTypeOptions
} from "../../../public/pages/CreateDetector/components/ConfigureAlerts/models/interfaces";
import { CreateDetectorRulesOptions } from "../../../public/models/types";

const { detectorMock, notificationChannelTypeOptionsMock, alertConditionMock } = modelsMock;
const detector: Detector = detectorMock;
const alertCondition: AlertCondition = alertConditionMock;
const notificationChannelTypeOptions: NotificationChannelTypeOptions = notificationChannelTypeOptionsMock;

export default {
  alertCondition,
  allNotificationChannels: [notificationChannelTypeOptions],
  rulesOptions: createDetectorRulesOptions,
  detector,
  indexNum: 0,
  isEdit: false,
  hasNotificationPlugin: true,
  loadingNotifications: false,
  onAlertTriggerChanged: jest.fn(),
  refreshNotificationChannels: jest.fn(),
};
