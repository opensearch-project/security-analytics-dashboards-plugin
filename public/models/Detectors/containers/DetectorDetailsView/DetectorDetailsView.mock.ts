/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { detectorMock, notificationsStart } from '../../../Interfaces.mock';

export default {
  detector: detectorMock,
  enabled_time: 1,
  last_update_time: 1,
  rulesCanFold: false,
  notifications: notificationsStart,
  editBasicDetails: jest.fn(),
  editDetectorRules: jest.fn(),
};
