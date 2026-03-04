/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { METHOD_NAMES, CONTENT_MANAGER_BASE_PATH } from '../utils/constants';

export function addWazuhRulesMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.CREATE_WAZUH_RULE] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/rules`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_WAZUH_RULE] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/rules/<%=ruleId%>`,
      req: {
        ruleId: {
          type: 'string',
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_WAZUH_RULE] = createAction({
    url: {
      fmt: `${CONTENT_MANAGER_BASE_PATH}/rules/<%=ruleId%>`,
      req: {
        ruleId: {
          type: 'string',
        },
      },
    },
    method: 'DELETE',
  });
}
