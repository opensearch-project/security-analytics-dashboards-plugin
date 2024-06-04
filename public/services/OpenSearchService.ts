/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HttpSetup,
  SavedObjectsClientContract,
  SimpleSavedObject,
} from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { dataSourceInfo } from './utils/constants';

export default class OpenSearchService {
  constructor(
    private httpClient: HttpSetup,
    private savedObjectsClient: SavedObjectsClientContract
  ) {}

  getPlugins = async (): Promise<ServerResponse<Plugin[]>> => {
    let url = `..${API.PLUGINS}`;
    return await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    });
  };

  getIndexPatterns = async (): Promise<SimpleSavedObject<{ title: string }>[]> => {
    const indexPatterns = await this.savedObjectsClient
      .find<{ title: string }>({
        type: 'index-pattern',
        fields: ['title', 'type'],
        perPage: 10000,
      })
      .then((response) => response.savedObjects);

    return Promise.resolve(indexPatterns);
  };
}
