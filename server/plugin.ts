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
import { DataSourcePluginSetup } from 'src/plugins/data_source/server';
import { securityAnalyticsPlugin } from './clusters/securityAnalyticsPlugin';

export interface SecurityAnalyticsPluginDependencies {
  dataSource?: DataSourcePluginSetup;
}

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  public constructor(
    private initializerContext: PluginInitializerContext<SecurityAnalyticsPluginConfigType>
  ) {}

  public async setup(core: CoreSetup, { dataSource }: SecurityAnalyticsPluginDependencies) {
    // Create OpenSearch client that aware of SA API endpoints
    const securityAnalyticsClient: ILegacyCustomClusterClient = createSecurityAnalyticsCluster(
      core
    );
    const dataSourceEnabled = !!dataSource;

    if (dataSourceEnabled) {
      dataSource.registerCustomApiSchema(securityAnalyticsPlugin);
    }

    // Initialize services
    const services: NodeServices = {
      detectorsService: new DetectorService(securityAnalyticsClient, dataSourceEnabled),
      correlationService: new CorrelationService(securityAnalyticsClient, dataSourceEnabled),
      indexService: new IndexService(securityAnalyticsClient, dataSourceEnabled),
      findingsService: new FindingsService(securityAnalyticsClient, dataSourceEnabled),
      opensearchService: new OpenSearchService(securityAnalyticsClient, dataSourceEnabled),
      fieldMappingService: new FieldMappingService(securityAnalyticsClient, dataSourceEnabled),
      alertService: new AlertService(securityAnalyticsClient, dataSourceEnabled),
      rulesService: new RulesService(securityAnalyticsClient, dataSourceEnabled),
      notificationsService: new NotificationsService(securityAnalyticsClient, dataSourceEnabled),
      logTypeService: new LogTypeService(securityAnalyticsClient, dataSourceEnabled),
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
