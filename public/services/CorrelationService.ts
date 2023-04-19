/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { ICorrelationsService } from '../../types/services/ICorrelationService';
import {
  CreateCorrelationRuleResponse,
  DeleteCorrelationRuleResponse,
  GetAllCorrelationsInTimeRangeResponse,
  GetCorrelationFindingsResponse,
  SearchCorrelationRulesResponse,
} from '../../types';

export default class CorrelationService implements ICorrelationsService {
  constructor(private httpClient: HttpSetup) {}

  getCorrelatedFindings = async (
    finding: string,
    detector_type: string,
    nearby_findings: number = 20
  ): Promise<ServerResponse<GetCorrelationFindingsResponse>> => {
    const url = `..${API.FINDINGS_BASE}/correlate`;
    return (await this.httpClient.get(url, {
      query: {
        finding,
        detector_type,
        nearby_findings,
      },
    })) as ServerResponse<GetCorrelationFindingsResponse>;
  };

  getCorrelationRules = async (): Promise<ServerResponse<SearchCorrelationRulesResponse>> => {
    const url = `..${API.CORRELATION_BASE}/_search`;

    let query = { match_all: {} };

    return (await this.httpClient.post(url, {
      body: JSON.stringify({
        query,
      }),
    })) as ServerResponse<SearchCorrelationRulesResponse>;
  };

  createCorrelationRule = async (
    body: any
  ): Promise<ServerResponse<CreateCorrelationRuleResponse>> => {
    const url = `..${API.CORRELATION_BASE}`;

    return (await this.httpClient.post(url, {
      body: JSON.stringify(body),
    })) as ServerResponse<CreateCorrelationRuleResponse>;
  };

  deleteCorrelationRule = async (
    ruleId: string
  ): Promise<ServerResponse<DeleteCorrelationRuleResponse>> => {
    const url = `..${API.CORRELATION_BASE}/${ruleId}`;
    return (await this.httpClient.delete(url)) as ServerResponse<DeleteCorrelationRuleResponse>;
  };

  getAllCorrelationsInTimeWindow = async (
    start_time: string,
    end_time: string
  ): Promise<ServerResponse<GetAllCorrelationsInTimeRangeResponse>> => {
    const url = `..${API.CORRELATIONS}`;
    return (await this.httpClient.get(url, {
      query: {
        start_time,
        end_time,
      },
    })) as ServerResponse<GetAllCorrelationsInTimeRangeResponse>;
  };
}
