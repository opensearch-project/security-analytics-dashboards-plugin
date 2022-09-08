/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API } from "../../utils/constants";

export default function securityAnalyticsPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.sa = components.clientAction.namespaceFactory();
  const sa = Client.prototype.sa.prototype;
}
