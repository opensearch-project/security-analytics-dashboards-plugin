/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from '.';
import { Plugin, CoreSetup, CoreStart, ILegacyCustomClusterClient } from '../../../src/core/server';
import { createSecurityAnalyticsCluster } from './clusters/createSecurityAnalyticsCluster';
import { NodeServices } from './models/interfaces';
import {
  setupDetectorRoutes,
  setupFindingsRoutes,
  setupOpensearchRoutes,
  setupFieldMappingRoutes,
  setupIndexRoutes,
  setupAlertsRoutes,
} from './routes';
import { setupRulesRoutes } from './routes/RuleRoutes';
import {
  IndexService,
  FindingsService,
  OpenSearchService,
  FieldMappingService,
  DetectorService,
  AlertService,
  RulesService,
} from './services';

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public async setup(core: CoreSetup) {
    // Create OpenSearch client that aware of SA API endpoints
    const osDriver: ILegacyCustomClusterClient = createSecurityAnalyticsCluster(core);

    // Initialize services
    const services: NodeServices = {
      detectorsService: new DetectorService(osDriver),
      indexService: new IndexService(osDriver),
      findingsService: new FindingsService(osDriver),
      opensearchService: new OpenSearchService(osDriver),
      fieldMappingService: new FieldMappingService(osDriver),
      alertService: new AlertService(osDriver),
      rulesService: new RulesService(osDriver),
    };

    // Create router
    const router = core.http.createRouter();

    // setup routes
    setupDetectorRoutes(services, router);
    setupIndexRoutes(services, router);
    setupFindingsRoutes(services, router);
    setupOpensearchRoutes(services, router);
    setupFieldMappingRoutes(services, router);
    setupAlertsRoutes(services, router);
    setupRulesRoutes(services, router);

    return {};
  }

  public async start(_core: CoreStart) {
    return {};
  }
}
