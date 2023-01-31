/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { GetIndicesResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { IIndexService } from '../../types';

export default class IndexService implements IIndexService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getIndices = async (): Promise<ServerResponse<GetIndicesResponse>> => {
    const url = `..${API.INDICES_BASE}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetIndicesResponse>;

    return response;
  };
}
