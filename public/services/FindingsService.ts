/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { GetFindingsParams, GetFindingsResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';

export default class FindingsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getFindings = async (
    detectorParams: GetFindingsParams = {}
  ): Promise<ServerResponse<GetFindingsResponse>> => {
    const { detectorType, detectorId } = detectorParams;
    let query: GetFindingsParams = {
      sortOrder: 'desc',
      size: 10000,
      ...detectorParams, // Include other properties from detectorParams
    };

    if (detectorId) {
      query = {
        ...query,
        detectorId,
      };
    } else if (detectorType) {
      query = {
        ...query,
        detectorType,
      };
    }
    return await this.httpClient.get(`..${API.GET_FINDINGS}`, { query });
  };
}
