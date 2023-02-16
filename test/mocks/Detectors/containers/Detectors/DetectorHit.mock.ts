/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorResponseMock from './DetectorResponse.mock';
import { DetectorHit } from '../../../../../types';

export default {
  _index: '.windows',
  _source: detectorResponseMock,
  _id: 'detector_id_1',
} as DetectorHit;
