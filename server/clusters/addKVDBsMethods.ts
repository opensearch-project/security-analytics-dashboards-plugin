/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { METHOD_NAMES, CONTENT_MANAGER_BASE_PATH } from '../utils/constants';

export function addKVDBsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.CREATE_KVDB] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/kvdbs`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_KVDB] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/kvdbs/<%=kvdbId%>`,
      req: {
        kvdbId: {
          type: 'string',
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_KVDB] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/kvdbs/<%=kvdbId%>`,
      req: {
        kvdbId: {
          type: 'string',
        },
      },
    },
    method: 'DELETE',
  });
}
