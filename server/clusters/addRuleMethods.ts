/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES, API } from '../utils/constants';

export function addRulesMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.CREATE_RULE] = createAction({
    url: {
      fmt: `${API.RULES_BASE}?category=<%=category%>`,
      req: {
        category: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.GET_RULES] = createAction({
    url: {
      fmt: `${API.RULES_BASE}/_search?pre_packaged=<%=prePackaged%>`,
      req: {
        prePackaged: {
          type: 'boolean',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });
}
