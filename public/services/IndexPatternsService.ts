/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GetFieldsOptions,
  IndexPatternSpec,
  IndexPatternsService as CoreIndexPatternsService,
} from '../../../../src/plugins/data/common/index_patterns';
import { IndexPatternSavedObjectAttrs } from '../../../../src/plugins/data/common/index_patterns/index_patterns';
import { SavedObject } from '../../../../src/plugins/data/common';

export default class IndexPatternsService {
  constructor(private coreIndexPatternsService: CoreIndexPatternsService) {}

  async getFieldsForWildcard(options: GetFieldsOptions) {
    return this.coreIndexPatternsService.getFieldsForWildcard(options);
  }

  async createAndSave(spec: IndexPatternSpec, override = false, skipFetchFields = false) {
    return this.coreIndexPatternsService.createAndSave(spec, override, skipFetchFields);
  }

  public getIndexPatterns = async (): Promise<
    SavedObject<IndexPatternSavedObjectAttrs>[] | null | undefined
  > => {
    const indexPatterns = await this.coreIndexPatternsService.getCache();

    return Promise.resolve(indexPatterns);
  };

  public getIndexPattern = async (
    detectorId: string
  ): Promise<Promise<SavedObject<IndexPatternSavedObjectAttrs>> | Promise<undefined>> => {
    let indexPattern;
    const indexPatterns = await this.getIndexPatterns();
    indexPatterns?.some((indexRef) => {
      if (indexRef.references.findIndex((reference) => reference.id === detectorId) > -1) {
        indexPattern = indexRef;
        return true;
      }

      return false;
    });

    return indexPattern;
  };

  public deleteIndexPattern = async (indexPatternId: string) =>
    await this.coreIndexPatternsService.delete(indexPatternId);
}
