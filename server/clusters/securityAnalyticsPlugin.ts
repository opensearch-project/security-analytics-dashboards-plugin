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
      fmt: `${API.RULESS_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });
}
