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
import { SearchResponse } from '../../server/models/interfaces';

export default class OpenSearchService {
  constructor(
    private httpClient: HttpSetup,
    private savedObjectsClient: SavedObjectsClientContract
  ) {}

  getPlugins = async (): Promise<ServerResponse<{ component: string }[]>> => {
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

  getDocuments = async (index: string, documentIds: string[]) => {
    let url = `..${API.DOCUMENT_IDS_QUERY}`;
    const res: ServerResponse<SearchResponse<any>> = await this.httpClient.post(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
      body: JSON.stringify({
        index,
        documentIds,
      }),
    });

    if (res.ok) {
      return res.response.hits.hits.map(({ _id, _source }) => ({
        id: _id,
        ..._source,
      }));
    }

    return [];
  };
}
