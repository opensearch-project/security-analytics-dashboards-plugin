/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import DetectorsService from '../services/DetectorService';
import IndexService from '../services/IndexService';

export interface BrowserServices {
  detectorsService: DetectorsService;
  indexService: IndexService;
}
