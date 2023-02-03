/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detector from '../Detectors/Detector.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
export default {
  detector: detector,
  editAlertTriggers: jest.fn(),
  notifications: notificationsStartMock,
};
