/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from ".";
import { Plugin, CoreSetup, CoreStart, ILegacyCustomClusterClient } from "../../../src/core/server";
import securityAnalyticsPlugin from "./clusters/securityAnalytics/securityAnalyticsPlugin";

export class SecurityAnalyticsPlugin implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public async setup(core: CoreSetup) {
    // Create OpenSearch client that aware of SA API endpoints
    const osDriver: ILegacyCustomClusterClient = core.opensearch.legacy.createClient("security_analytics", {
      plugins: [securityAnalyticsPlugin],
    });

    // Initialize services
    const services = {};

    // Create router
    const router = core.http.createRouter();

    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
