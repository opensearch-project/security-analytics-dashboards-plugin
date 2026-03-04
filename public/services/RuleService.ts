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

  // Wazuh: added space parameter to getRules API
  getRules = async (
    prePackaged: boolean,
    body: any,
    space?: string
  ): Promise<ServerResponse<GetRulesResponse>> => {
    const url = `..${API.RULES_BASE}/_search`;
    return (await this.httpClient.post(url, {
      query: {
        prePackaged,
        ...(space !== undefined && { space }),
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
      body: JSON.stringify(body),
    })) as ServerResponse<GetRulesResponse>;
  };

  // Wazuh: added integrationId parameter to createRule
  createRule = async (rule: {
    document: Rule;
    integrationId: string;
  }): Promise<ServerResponse<CreateRuleResponse>> => {
    const url = `..${API.RULES_BASE}`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify(rule),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<CreateRuleResponse>;
  };

  // Wazuh: removed category parameter from updateRule API
  updateRule = async (
    ruleId: string,
    rule: { document: Rule }
  ): Promise<ServerResponse<UpdateRuleResponse>> => {
    const url = `..${API.RULES_BASE}/${ruleId}`;
    return (await this.httpClient.put(url, {
      query: {
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
