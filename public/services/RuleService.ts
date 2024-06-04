/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  CreateRuleResponse,
  DeleteRuleResponse,
  GetRulesResponse,
  UpdateRuleResponse,
} from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { Rule } from '../../types';
import { dataSourceInfo } from './utils/constants';

export default class RuleService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getRules = async (prePackaged: boolean, body: any): Promise<ServerResponse<GetRulesResponse>> => {
    const url = `..${API.RULES_BASE}/_search`;
    return (await this.httpClient.post(url, {
      query: {
        prePackaged,
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
      body: JSON.stringify(body),
    })) as ServerResponse<GetRulesResponse>;
  };

  createRule = async (rule: Rule): Promise<ServerResponse<CreateRuleResponse>> => {
    const url = `..${API.RULES_BASE}`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify(rule),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<CreateRuleResponse>;
  };

  updateRule = async (
    ruleId: string,
    category: string,
    rule: Rule
  ): Promise<ServerResponse<UpdateRuleResponse>> => {
    const url = `..${API.RULES_BASE}/${ruleId}`;
    return (await this.httpClient.put(url, {
      query: {
        category,
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
      body: JSON.stringify(rule),
    })) as ServerResponse<UpdateRuleResponse>;
  };

  deleteRule = async (ruleId: string): Promise<ServerResponse<DeleteRuleResponse>> => {
    const url = `..${API.RULES_BASE}/${ruleId}`;
    return (await this.httpClient.delete(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<DeleteRuleResponse>;
  };
}
