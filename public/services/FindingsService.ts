/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup, NotificationsStart } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import {
  GetFindingsParams,
  GetFindingsResponse,
  GetThreatIntelFindingsParams,
  GetThreatIntelFindingsResponse,
} from '../../types';
import { dataSourceInfo } from './utils/constants';
import { errorNotificationToast } from '../utils/helpers';

export class FindingsService {
  constructor(private httpClient: HttpSetup, private notifications: NotificationsStart) {}

  getFindings = async (
    getFindingsParams: GetFindingsParams
  ): Promise<ServerResponse<GetFindingsResponse>> => {
    const findingIds = getFindingsParams.findingIds
      ? getFindingsParams.findingIds.join(',')
      : undefined;
    const query = {
      sortOrder: 'desc',
      size: 10000,
      ...getFindingsParams,
      findingIds,
      dataSourceId: dataSourceInfo.activeDataSource.id,
    };

    return await this.httpClient.get(`..${API.GET_FINDINGS}`, { query });
  };

  getThreatIntelFindings = async (
    getFindingsParams: GetThreatIntelFindingsParams
  ): Promise<ServerResponse<GetThreatIntelFindingsResponse>> => {
    const query = {
      sortOrder: 'desc',
      size: 10000,
      ...getFindingsParams,
      dataSourceId: dataSourceInfo.activeDataSource.id,
    };

    const res = await this.httpClient.get(`..${API.THREAT_INTEL_BASE}/findings/_search`, { query });

    if (!res.ok) {
      errorNotificationToast(this.notifications, 'get', 'findings', res.error);
    }

    return res;
  };
}
