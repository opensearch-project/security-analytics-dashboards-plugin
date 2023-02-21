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

  securityAnalytics[METHOD_NAMES.DELETE_RULE] = createAction({
    url: {
      fmt: `${API.RULES_BASE}/<%=ruleId%>?forced=true`,
      req: {
        ruleId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_RULE] = createAction({
    url: {
      fmt: `${API.RULES_BASE}/<%=ruleId%>?category=<%=category%>&forced=true`,
      req: {
        ruleId: {
          type: 'string',
          required: true,
        },
        category: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.GET_ALL_RULE_CATEGORIES] = createAction({
    url: {
      fmt: `${API.RULES_BASE}/categories`,
      method: 'GET',
    },
  });
}
