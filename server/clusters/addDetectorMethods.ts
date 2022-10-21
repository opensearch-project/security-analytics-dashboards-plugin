/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API, METHOD_NAMES } from '../utils/constants';

export function addDetectorMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.CREATE_DETECTOR] = createAction({
    url: {
      fmt: `${API.DETECTORS_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.GET_DETECTOR] = createAction({
    url: {
      fmt: `${API.DETECTORS_BASE}/<%=detectorId%>`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.SEARCH_DETECTORS] = createAction({
    url: {
      fmt: `${API.SEARCH_DETECTORS}`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_DETECTOR] = createAction({
    url: {
      fmt: `${API.DETECTORS_BASE}/<%=detectorId%>`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_DETECTOR] = createAction({
    url: {
      fmt: `${API.DETECTORS_BASE}/<%=detectorId%>`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });
}
