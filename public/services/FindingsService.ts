/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { GetFindingsParams, GetFindingsResponse } from '../../types';
import { dataSourceInfo } from './utils/constants';

export default class FindingsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getFindings = async (
    detectorParams: GetFindingsParams
  ): Promise<ServerResponse<GetFindingsResponse>> => {
    const findingIds = detectorParams.findingIds
      ? JSON.stringify(detectorParams.findingIds)
      : undefined;
    const query = {
      sortOrder: 'desc',
      size: 10000,
      ...detectorParams,
      findingIds,
      dataSourceId: dataSourceInfo.activeDataSource.id,
    };

    return await this.httpClient.get(`..${API.GET_FINDINGS}`, { query });
  };
}
