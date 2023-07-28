/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API, METHOD_NAMES } from '../utils/constants';

export function addLogTypeMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.SEARCH_LOGTYPES] = createAction({
    url: {
      fmt: `${API.LOGTYPE_BASE}/_search`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.CREATE_LOGTYPE] = createAction({
    url: {
      fmt: `${API.LOGTYPE_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_LOGTYPE] = createAction({
    url: {
      fmt: `${API.LOGTYPE_BASE}/<%=logTypeId%>`,
      req: {
        logTypeId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_LOGTYPE] = createAction({
    url: {
      fmt: `${API.LOGTYPE_BASE}/<%=logTypeId%>`,
      req: {
        logTypeId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });
}
