/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorMock from '../Detectors/Detector.mock';

export default {
  detector: detectorMock,
  editAlertTriggers: jest.fn(),
  notifications: notificationsStartMock,
};
