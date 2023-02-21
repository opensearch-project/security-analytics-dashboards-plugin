import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  CreateRuleResponse,
  DeleteRuleResponse,
  GetAllRuleCategoriesResponse,
  GetRulesResponse,
  UpdateRuleResponse,
} from '../../server/models/interfaces/Rules';
import { API } from '../../server/utils/constants';
import { Rule } from '../../models/interfaces';

export default class RuleService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getRules = async (prePackaged: boolean, body: any): Promise<ServerResponse<GetRulesResponse>> => {
    const url = `..${API.RULES_BASE}/_search`;
    const response = (await this.httpClient.post(url, {
      query: {
        prePackaged,
      },
      body: JSON.stringify(body),
    })) as ServerResponse<GetRulesResponse>;

    return response;
  };

  createRule = async (rule: Rule): Promise<ServerResponse<CreateRuleResponse>> => {
    const url = `..${API.RULES_BASE}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(rule),
    })) as ServerResponse<CreateRuleResponse>;

    return response;
  };

  updateRule = async (
    ruleId: string,
    category: string,
    rule: Rule
  ): Promise<ServerResponse<UpdateRuleResponse>> => {
    const url = `..${API.RULES_BASE}/${ruleId}`;
    const response = (await this.httpClient.put(url, {
      query: {
        category,
      },
      body: JSON.stringify(rule),
    })) as ServerResponse<UpdateRuleResponse>;

    return response;
  };

  deleteRule = async (ruleId: string): Promise<ServerResponse<DeleteRuleResponse>> => {
    const url = `..${API.RULES_BASE}/${ruleId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<DeleteRuleResponse>;

    return response;
  };

  getAllRuleCategories = async (): Promise<ServerResponse<GetAllRuleCategoriesResponse>> => {
    const url = `..${API.RULES_BASE}/categories`;
    const response = (await this.httpClient.get(url)) as ServerResponse<
      GetAllRuleCategoriesResponse
    >;

    return response;
  };
}
