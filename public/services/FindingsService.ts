/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { GetFindingsResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';

export default class FindingsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getFindings = async (detectorType: string): Promise<ServerResponse<GetFindingsResponse>> =>
    await this.httpClient.get(`..${API.GET_FINDINGS}`, { query: { detectorType } });
}
