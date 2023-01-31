/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GetFieldsOptions,
  IndexPatternSpec,
  IndexPatternsService as CoreIndexPatternsService,
} from '../../../../src/plugins/data/common/index_patterns';

export default class IndexPatternsService {
  constructor(private coreIndexPatternsService: CoreIndexPatternsService) {}

  async getFieldsForWildcard(options: GetFieldsOptions) {
    return this.coreIndexPatternsService.getFieldsForWildcard(options);
  }

  async createAndSave(spec: IndexPatternSpec, override = false, skipFetchFields = false) {
    return this.coreIndexPatternsService.createAndSave(spec, override, skipFetchFields);
  }
}
