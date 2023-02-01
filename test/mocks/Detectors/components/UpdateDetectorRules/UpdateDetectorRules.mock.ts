/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDetectorHit } from '../../containers/Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';

export default {
  notifications: mockNotificationsStart,
  detectorHit: mockDetectorHit,
  location: {
    pathname: '',
  },
};
