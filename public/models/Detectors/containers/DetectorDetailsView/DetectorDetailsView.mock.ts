/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDetector, mockNotificationsStart } from '../../../Interfaces.mock';

export default {
  detector: mockDetector,
  enabled_time: 1,
  last_update_time: 1,
  rulesCanFold: false,
  notifications: mockNotificationsStart,
  editBasicDetails: jest.fn(),
  editDetectorRules: jest.fn(),
};
