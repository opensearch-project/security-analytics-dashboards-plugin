/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { SearchResponse, Plugin } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';

export default class OpenSearchService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  documentIdsQuery = async (
    index: string,
    documentIds: string[]
  ): Promise<ServerResponse<SearchResponse<any>>> => {
    if (!index || !documentIds) return;
    return (await this.httpClient.get(`..${API.DOCUMENT_IDS_QUERY}`, {
      query: { index, documentIds },
    })) as ServerResponse<SearchResponse<any>>;
  };

  timeRangeQuery = async (
    index: string,
    timeField = 'timestamp',
    startTime = 'now-15m',
    endTime = 'now'
  ): Promise<ServerResponse<SearchResponse<any>>> => {
    if (!index) return;
    return (await this.httpClient.get(`..${API.TIME_RANGE_QUERY}`, {
      query: { index, timeField, startTime, endTime },
    })) as ServerResponse<SearchResponse<any>>;
  };

  getPlugins = async (): Promise<ServerResponse<Plugin[]>> => {
    let url = `..${API.PLUGINS}`;
    return await this.httpClient.get(url);
  };
}
