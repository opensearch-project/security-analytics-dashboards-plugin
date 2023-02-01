/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDetector } from '../Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';

export default {
  detector: mockDetector,
  enabled_time: 1,
  last_update_time: 1,
  rulesCanFold: false,
  notifications: mockNotificationsStart,
  editBasicDetails: jest.fn(),
  editDetectorRules: jest.fn(),
};
