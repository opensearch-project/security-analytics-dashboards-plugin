/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorMock from '../Detectors/Detector.mock';

export default {
  detector: detectorMock,
  enabled_time: 1,
  last_update_time: 1,
  rulesCanFold: false,
  notifications: notificationsStartMock,
  editBasicDetails: jest.fn(),
  editDetectorRules: jest.fn(),
};
