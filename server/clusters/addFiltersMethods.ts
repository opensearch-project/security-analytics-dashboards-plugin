/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { METHOD_NAMES, CONTENT_MANAGER_BASE_PATH } from '../utils/constants';

export function addFiltersMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.CREATE_FILTER] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/filters`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_FILTER] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/filters/<%=filterId%>`,
      req: {
        filterId: { type: 'string' },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_FILTER] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/filters/<%=filterId%>`,
      req: {
        filterId: { type: 'string' },
      },
    },
    method: 'DELETE',
  });
}
