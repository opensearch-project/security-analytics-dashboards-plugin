import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { CreateRulesResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { EXAMPLE_FIELD_MAPPINGS_RESPONSE } from '../pages/CreateDetector/components/ConfigureFieldMapping/utils/dummyData';

export default class RulesService {
  constructor(private readonly httpClient: HttpSetup) {}

  getRules = async (
    indexName: string,
    ruleTopic?: string
  ): Promise<ServerResponse<CreateRulesResponse>> => {
    const url = `..${API.MAPPINGS_VIEW}`;
    const response = (await this.httpClient.get(url, {
      query: {
        indexName,
        ruleTopic,
      },
    })) as ServerResponse<GetRulesViewResponse>;

    if (response.ok) {
      response.response = RULES_RESPONSE;
    }

    return response;
  };
}
