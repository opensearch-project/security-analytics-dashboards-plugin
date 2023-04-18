/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API, METHOD_NAMES } from '../utils/constants';

export function addCorrelationMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_CORRELATION_RULES] = createAction({
    url: {
      fmt: `${API.CORRELATION_BASE}/_search`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.CREATE_CORRELATION_RULE] = createAction({
    url: {
      fmt: `${API.CORRELATION_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.DELETE_CORRELATION_RULE] = createAction({
    url: {
      fmt: `${API.CORRELATION_BASE}/<%=ruleId%>`,
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

  securityAnalytics[METHOD_NAMES.GET_CORRELATED_FINDINGS] = createAction({
    url: {
      fmt: `${API.FINDINGS_BASE}/correlate`,
      req: {
        finding: {
          type: 'string',
          required: true,
        },
        detector_type: {
          type: 'string',
          required: true,
        },
        nearby_findings: {
          type: 'number',
          required: false,
        },
      },
    },
    needBody: false,
    method: 'GET',
  });
}
