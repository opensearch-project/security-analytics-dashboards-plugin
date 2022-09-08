/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Legacy } from "opensearch-dashboards";
import securityAnalyticsPlugin from "./securityAnalyticsPlugin";
import { CLUSTER, DEFAULT_HEADERS } from "../../utils/constants";

type Server = Legacy.Server;

export default function createSecurityAnalyticsCluster(server: Server) {
  const { customHeaders, ...rest } = server.config().get("opensearch");
  server.plugins.opensearch.createCluster(CLUSTER.SA, {
    plugins: [securityAnalyticsPlugin],
    customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
    ...rest,
  });
}
