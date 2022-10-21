/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API, METHOD_NAMES, PLUGIN_PROPERTY_NAME } from '../utils/constants';

export function securityAnalyticsPlugin(Client: any, config: any, components: any) {
  const createAction = components.clientAction.factory;

  Client.prototype[PLUGIN_PROPERTY_NAME] = components.clientAction.namespaceFactory();
  const securityAnalytics = Client.prototype[PLUGIN_PROPERTY_NAME].prototype;

  securityAnalytics[METHOD_NAMES.CREATE_RULE] = createAction({
    url: {
      fmt: `${API.RULES_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.GET_RULES] = createAction({
    url: {
      fmt: `${API.RULES_BASE}/_search?pre_packaged=<%=pre_packaged%>`,
      req: {
        pre_packaged: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });
}
