/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDetectorHit, notificationsStart } from '../../../Interfaces.mock';

export default {
  notifications: notificationsStart,
  detectorHit: mockDetectorHit,
  location: {
    pathname: '',
  },
};
