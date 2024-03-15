/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES, API, BASE_API_PATH } from '../utils/constants';

export function addAlertsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_ALERTS] = createAction({
    url: {
      fmt: `${API.GET_ALERTS}`,
      params: {
        detector_id: {
          type: 'string',
        },
        sortOrder: {
          type: 'string',
        },
        size: {
          type: 'number',
        },
        startIndex: {
          type: 'number',
        },
      },
    },
    needBody: false,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.ACKNOWLEDGE_ALERTS] = createAction({
    url: {
      fmt: `${BASE_API_PATH}/detectors/<%=detector_id%>/_acknowledge/alerts`,
      req: {
        detector_id: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });
}
