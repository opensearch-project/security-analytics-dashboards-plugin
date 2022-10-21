/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API, METHOD_NAMES } from '../utils/constants';

export function addFieldMappingMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_MAPPINGS_VIEW] = createAction({
    url: {
      fmt: `${API.MAPPINGS_VIEW}?index_name=<%=indexName%>&rule_topic=<%=ruleTopic%>`,
      req: {
        indexName: {
          type: 'string',
          required: true,
        },
        ruleTopic: {
          type: 'string',
          required: false,
        },
      },
    },
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.CREATE_MAPPINGS] = createAction({
    url: {
      fmt: `${API.MAPPINGS_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.GET_MAPPINGS] = createAction({
    url: {
      fmt: `${API.MAPPINGS_BASE}`,
    },
    needBody: false,
    method: 'GET',
  });
}
