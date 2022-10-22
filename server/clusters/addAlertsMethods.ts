/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES, API } from '../utils/constants';

export function addAlertsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_ALERTS] = createAction({
    url: {
      fmt: `${API.GET_ALERTS}?detectorId=<%=detectorId%>`,
      req: {
        detectorId: {
          type: 'string',
          required: false,
        },
      },
    },
    needBody: false,
    method: 'GET',
  });
}
