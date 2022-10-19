/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from '.';
import { Plugin, CoreSetup, CoreStart, ILegacyCustomClusterClient } from '../../../src/core/server';
import { createSecurityAnalyticsCluster } from './clusters/createSecurityAnalyticsCluster';
import { NodeServices } from './models/interfaces';
import { FindingsRoutes, OpenSearchRoutes } from './routes';
import { setupDetectorRoutes } from './routes';
import { setupIndexRoutes } from './routes/IndexRoutes';
import DetectorsService from './services/DetectorService';
import IndexService from './services/IndexService';
import FindingsService from './services/FindingsService';
import OpenSearchService from './services/OpenSearchService';

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public async setup(core: CoreSetup) {
    // Create OpenSearch client that aware of SA API endpoints
    const osDriver: ILegacyCustomClusterClient = createSecurityAnalyticsCluster(core);

    // Initialize services
    const services: NodeServices = {
      detectorsService: new DetectorsService(osDriver),
      indexService: new IndexService(osDriver),
      findingsService: new FindingsService(osDriver),
      opensearchService: new OpenSearchService(osDriver),
    };

    // Create router
    const router = core.http.createRouter();

    // setup routes
    setupDetectorRoutes(services, router);
    setupIndexRoutes(services, router);
    FindingsRoutes(services, router);
    OpenSearchRoutes(services, router);

    return {};
  }

  public async start(_core: CoreStart) {
    return {};
  }
}
