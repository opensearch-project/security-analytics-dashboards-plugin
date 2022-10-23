import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { CreateRulesResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';

export default class RulesService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getRules = async (searchIndex: string): Promise<ServerResponse<CreateRulesResponse>> => {
    const url = `..${API.RULES_BASE}`;
    const response = (await this.httpClient.post(url, {
      query: {
        searchIndex,
      },
    })) as ServerResponse<CreateRulesResponse>;

    return response;
  };

  createRule = async (searchIndex: string): Promise<ServerResponse<CreateRulesResponse>> => {
    const url = `..${API.RULES_BASE}`;
    const response = (await this.httpClient.post(url, {
      query: {
        searchIndex,
      },
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
