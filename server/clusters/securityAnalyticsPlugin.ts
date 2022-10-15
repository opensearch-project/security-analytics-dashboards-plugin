/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API, METHOD_NAMES, PLUGIN_PROPERTY_NAME } from '../utils/constants';

export function securityAnalyticsPlugin(Client: any, config: any, components: any) {
  const createAction = components.clientAction.factory;

  Client.prototype[PLUGIN_PROPERTY_NAME] = components.clientAction.namespaceFactory();
  const securityAnalytics = Client.prototype.sap.prototype;

  securityAnalytics[METHOD_NAMES.CREATE_DETECTOR] = createAction({
    url: {
      fmt: `${API.DETECTORS_BASE}`,
    },
    needBody: true,
    method: 'POST',
  });
}
