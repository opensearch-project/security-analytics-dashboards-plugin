/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES } from '../utils/constants';

export function addNotificationsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_CHANNEl] = createAction({
    url: {
      fmt: '/_plugins/_notifications/configs/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.GET_CHANNElS] = createAction({
    url: {
      fmt: '/_plugins/_notifications/channels',
    },
    needBody: false,
    method: 'GET',
  });
}
