/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from '.';
import { Plugin, CoreSetup, CoreStart, ILegacyCustomClusterClient } from '../../../src/core/server';
import { createSecurityAnalyticsCluster } from './clusters/createSecurityAnalyticsCluster';
import { NodeServices } from './models/interfaces';
import { setupDetectorRoutes } from './routes';
import { setupFieldMappingRoutes } from './routes/FieldMappingRoutes';
import { setupIndexRoutes } from './routes/IndexRoutes';
import DetectorsService from './services/DetectorService';
import FieldMappingService from './services/FieldMappingService';
import IndexService from './services/IndexService';

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public async setup(core: CoreSetup) {
    // Create OpenSearch client that aware of SA API endpoints
    const osDriver: ILegacyCustomClusterClient = createSecurityAnalyticsCluster(core);

    // Initialize services
    const services: NodeServices = {
      detectorsService: new DetectorsService(osDriver),
      indexService: new IndexService(osDriver),
      fieldMappingService: new FieldMappingService(osDriver),
    };

    // Create router
    const router = core.http.createRouter();

    // setup routes
    setupDetectorRoutes(services, router);
    setupIndexRoutes(services, router);
    setupFieldMappingRoutes(services, router);

    return {};
  }

  public async start(_core: CoreStart) {
    return {};
  }
}
