/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { ICorrelationsService } from '../../types/services/ICorrelationService';

export default class CorrelationService implements ICorrelationsService {
  constructor(private httpClient: HttpSetup) {}

  getCorrelationRules = async (index?: string): Promise<ServerResponse<any>> => {
    const url = `..${API.CORRELATION_BASE}/_search`;

    let query = { match_all: {} };

    return (await this.httpClient.post(url, {
      body: JSON.stringify({
        query,
      }),
    })) as ServerResponse<any>;
  };

  createCorrelationRule = async (body: any): Promise<any> => {
    const url = `..${API.CORRELATION_BASE}`;

    return (await this.httpClient.post(url, {
      body: JSON.stringify(body),
    })) as ServerResponse<any>;
  };

  deleteCorrelationRule = async (ruleId: any): Promise<any> => {
    const url = `..${API.CORRELATION_BASE}/${ruleId}`;
    return (await this.httpClient.delete(url)) as ServerResponse<any>;
  };
}
