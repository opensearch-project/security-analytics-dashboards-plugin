/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { GetFieldMappingViewResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { EXAMPLE_FIELD_MAPPINGS_RESPONSE } from '../pages/CreateDetector/components/ConfigureFieldMapping/utils/dummyData';

export default class FieldMappingService {
  constructor(private readonly httpClient: HttpSetup) {}

  getMappingsView = async (
    indexName: string,
    ruleTopic?: string
  ): Promise<ServerResponse<GetFieldMappingViewResponse>> => {
    const url = `..${API.MAPPINGS_VIEW}`;
    const response = (await this.httpClient.get(url, {
      query: {
        indexName,
        ruleTopic,
      },
    })) as ServerResponse<GetFieldMappingViewResponse>;

    if (response.ok) {
      response.response = EXAMPLE_FIELD_MAPPINGS_RESPONSE;
    }

    return response;
  };
}
