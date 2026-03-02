/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { METHOD_NAMES } from '../utils/constants';

const CONTENT_MANAGER_BASE_PATH = '/_plugins/_content_manager';

export function addDecoderMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.CREATE_DECODER] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/decoders`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_DECODER] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/decoders/<%=decoderId%>`,
      req: {
        decoderId: {
          type: 'string',
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_DECODER] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/decoders/<%=decoderId%>`,
      req: {
        decoderId: {
          type: 'string',
        },
      },
    },
    method: 'DELETE',
  });
}
