/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorsService, FindingsService, OpenSearchService } from '../services';
import IndexService from '../services/IndexService';

export interface BrowserServices {
  detectorService: DetectorsService;
  findingsService: FindingsService;
  indexService: IndexService;
  opensearchService: OpenSearchService;
}
