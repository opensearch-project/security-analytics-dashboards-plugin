/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from '.';
import {
  Plugin,
  CoreSetup,
  CoreStart,
  ILegacyCustomClusterClient,
  PluginInitializerContext,
} from '../../../src/core/server';
import { createSecurityAnalyticsCluster } from './clusters/createSecurityAnalyticsCluster';
import { NodeServices } from './models/interfaces';
import {
  setupDetectorRoutes,
  setupCorrelationRoutes,
  setupFindingsRoutes,
  setupOpensearchRoutes,
  setupFieldMappingRoutes,
  setupIndexRoutes,
  setupAlertsRoutes,
  setupNotificationsRoutes,
  setupLogTypeRoutes,
  setupRulesRoutes,
} from './routes';
import { setupMetricsRoutes } from './routes/MetricsRoutes';
import {
  IndexService,
  FindingsService,
  OpenSearchService,
  FieldMappingService,
  DetectorService,
  AlertService,
  RulesService,
  NotificationsService,
  CorrelationService,
} from './services';
import { LogTypeService } from './services/LogTypeService';
import MetricsService from './services/MetricsService';
import { SecurityAnalyticsPluginConfigType } from '../config';

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public constructor(
    private initializerContext: PluginInitializerContext<SecurityAnalyticsPluginConfigType>
  ) {}

  public async setup(core: CoreSetup) {
    // Create OpenSearch client that aware of SA API endpoints
    const osDriver: ILegacyCustomClusterClient = createSecurityAnalyticsCluster(core);

    // Initialize services
    const services: NodeServices = {
      detectorsService: new DetectorService(osDriver),
      correlationService: new CorrelationService(osDriver),
      indexService: new IndexService(osDriver),
      findingsService: new FindingsService(osDriver),
      opensearchService: new OpenSearchService(osDriver),
      fieldMappingService: new FieldMappingService(osDriver),
      alertService: new AlertService(osDriver),
      rulesService: new RulesService(osDriver),
      notificationsService: new NotificationsService(osDriver),
      logTypeService: new LogTypeService(osDriver),
      metricsService: new MetricsService(),
    };

    // Create router
    const router = core.http.createRouter();

    // setup routes
    setupDetectorRoutes(services, router);
    setupCorrelationRoutes(services, router);
    setupIndexRoutes(services, router);
    setupFindingsRoutes(services, router);
    setupOpensearchRoutes(services, router);
    setupFieldMappingRoutes(services, router);
    setupAlertsRoutes(services, router);
    setupRulesRoutes(services, router);
    setupNotificationsRoutes(services, router);
    setupLogTypeRoutes(services, router);
    setupMetricsRoutes(services, router);

    // @ts-ignore
    const config$ = this.initializerContext.config.create();

    return {
      config$,
    };
  }

  public async start(_core: CoreStart) {
    return {};
  }
}
