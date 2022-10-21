/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from '.';
import { Plugin, CoreSetup, CoreStart, ILegacyCustomClusterClient } from '../../../src/core/server';
import { createSecurityAnalyticsCluster } from './clusters/createSecurityAnalyticsCluster';
import { NodeServices } from './models/interfaces';
import { setupRuleRoutes } from './routes';
import RulesService from './services/ruleService';
import {
  setupDetectorRoutes,
  setupFindingsRoutes,
  setupOpensearchRoutes,
  setupFieldMappingRoutes,
  setupIndexRoutes,
} from './routes';
import {
  IndexService,
  FindingsService,
  OpenSearchService,
  FieldMappingService,
  DetectorService,
} from './services';

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public async setup(core: CoreSetup) {
    // Create OpenSearch client that aware of SA API endpoints
    const osDriver: ILegacyCustomClusterClient = createSecurityAnalyticsCluster(core);

    // Initialize services
    const services: NodeServices = {
      rulesService: new RulesService(osDriver),
      detectorsService: new DetectorService(osDriver),
      indexService: new IndexService(osDriver),
      findingsService: new FindingsService(osDriver),
      opensearchService: new OpenSearchService(osDriver),
      fieldMappingService: new FieldMappingService(osDriver),
    };

    // Create router
    const router = core.http.createRouter();

    // setup routes
    setupRuleRoutes(services, router);
    setupDetectorRoutes(services, router);
    setupIndexRoutes(services, router);
    setupFindingsRoutes(services, router);
    setupOpensearchRoutes(services, router);
    setupFieldMappingRoutes(services, router);

    return {};
  }

  public async start(_core: CoreStart) {
    return {};
  }
}
