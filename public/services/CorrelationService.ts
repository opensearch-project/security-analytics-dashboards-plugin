/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import {
  CreateCorrelationRuleResponse,
  DeleteCorrelationRuleResponse,
  GetAllCorrelationsInTimeRangeResponse,
  GetCorrelationFindingsResponse,
  SearchCorrelationRulesResponse,
  ICorrelationsService,
  UpdateCorrelationRuleResponse,
} from '../../types';
import { dataSourceInfo } from './utils/constants';

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
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetCorrelationFindingsResponse>;
  };

  getCorrelationRules = async (
    index?: string,
    query?: object
  ): Promise<ServerResponse<SearchCorrelationRulesResponse>> => {
    const url = `..${API.CORRELATION_BASE}/_search`;

    return (await this.httpClient.post(url, {
      body: JSON.stringify({
        query: query ?? { match_all: {} },
      }),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<SearchCorrelationRulesResponse>;
  };

  createCorrelationRule = async (
    body: any
  ): Promise<ServerResponse<CreateCorrelationRuleResponse>> => {
    const url = `..${API.CORRELATION_BASE}`;

    return (await this.httpClient.post(url, {
      body: JSON.stringify(body),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<CreateCorrelationRuleResponse>;
  };

  updateCorrelationRule = async (
    id: string,
    body: any
  ): Promise<ServerResponse<UpdateCorrelationRuleResponse>> => {
    const url = `..${API.CORRELATION_BASE}/${id}`;

    return (await this.httpClient.put(url, {
      body: JSON.stringify(body),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<UpdateCorrelationRuleResponse>;
  };

  deleteCorrelationRule = async (
    ruleId: string
  ): Promise<ServerResponse<DeleteCorrelationRuleResponse>> => {
    const url = `..${API.CORRELATION_BASE}/${ruleId}`;
    return (await this.httpClient.delete(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<DeleteCorrelationRuleResponse>;
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
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetAllCorrelationsInTimeRangeResponse>;
  };
}
