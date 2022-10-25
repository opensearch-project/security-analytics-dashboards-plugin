import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { CreateRulesResponse, GetRulesResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { Rule } from '../../models/interfaces';

export default class RulesService {
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

  createRule = async (rule: Rule): Promise<ServerResponse<CreateRulesResponse>> => {
    const url = `..${API.RULES_BASE}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(rule),
    })) as ServerResponse<CreateRulesResponse>;

    return response;
  };

  updateRule = async (searchIndex: string): Promise<ServerResponse<CreateRulesResponse>> => {
    const url = `..${API.RULES_BASE}`;
    const response = (await this.httpClient.post(url, {
      query: {
        searchIndex,
      },
    })) as ServerResponse<CreateRulesResponse>;

    return response;
  };

  deleteRule = async (searchIndex: string): Promise<ServerResponse<CreateRulesResponse>> => {
    const url = `..${API.RULES_BASE}`;
    const response = (await this.httpClient.post(url, {
      query: {
        searchIndex,
      },
    })) as ServerResponse<CreateRulesResponse>;

    return response;
  };
}
