/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES, API } from '../utils/constants';

export function addFindingsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_FINDINGS] = createAction({
    url: {
      fmt: `${API.GET_FINDINGS}?detector_id=<%=detectorId%>`,
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
