/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { GetAliasesResponse, GetIndicesResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { IIndexService } from '../../types';

export default class IndexService implements IIndexService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getIndexFields = async (indexName: string) => {
    const url = `..${API.INDICES_BASE}`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify({
        index: indexName,
      }),
    })) as ServerResponse<string[]>;
  };

  getIndices = async (): Promise<ServerResponse<GetIndicesResponse>> => {
    const url = `..${API.INDICES_BASE}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetIndicesResponse>;

    return response;
  };

  getAliases = async (): Promise<ServerResponse<GetAliasesResponse>> => {
    const url = `..${API.ALIASES_BASE}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetAliasesResponse>;

    return response;
  };

  updateAliases = async (actions: any): Promise<ServerResponse<{}>> => {
    const url = `..${API.UPDATE_ALIASES}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(actions),
    })) as ServerResponse<{}>;

    return response;
  };
}
