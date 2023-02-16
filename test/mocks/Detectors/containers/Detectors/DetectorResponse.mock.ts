/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorMock from './Detector.mock';
import { DetectorResponse } from '../../../../../types';

export default {
  last_update_time: 1,
  enabled_time: 1,
  ...detectorMock,
} as DetectorResponse;
