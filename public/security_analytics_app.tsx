/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, AppMountParameters } from 'opensearch-dashboards/public';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import {
  AlertsService,
  NotificationsService,
  IndexPatternsService,
  LogTypeService,
  SecurityAnalyticsContext,
} from './services';
import { DarkModeContext } from './components/DarkMode';
import Main from './pages/Main';
import { CoreServicesContext } from './components/core_services';
import './app.scss';
import DetectorsService from './services/DetectorService';
import IndexService from './services/IndexService';
import FindingsService from './services/FindingsService';
import OpenSearchService from './services/OpenSearchService';
import { BrowserServices } from './models/interfaces';
import FieldMappingService from './services/FieldMappingService';
import RuleService from './services/RuleService';
import SavedObjectService from './services/SavedObjectService';
import { SecurityAnalyticsPluginStartDeps } from './plugin';
import { DataStore } from './store/DataStore';
import CorrelationService from './services/CorrelationService';
import { LogType } from '../types';
import MetricsService from './services/MetricsService';
import { MetricsContext } from './metrics/MetricsContext';
import { CHANNEL_TYPES } from './pages/CreateDetector/components/ConfigureAlerts/utils/constants';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { getPlugins, setIsNotificationPluginInstalled } from './utils/helpers';
import { OS_NOTIFICATION_PLUGIN } from './utils/constants';
import ThreatIntelService from './services/ThreatIntelService';

export function renderApp(
  coreStart: CoreStart,
  params: AppMountParameters,
  landingPage: string,
  depsStart: SecurityAnalyticsPluginStartDeps,
  dataSourceManagement?: DataSourceManagementPluginSetup
) {
  const { http, savedObjects } = coreStart;

  const detectorsService = new DetectorsService(http);
  const correlationsService = new CorrelationService(http);
  const indexService = new IndexService(http);
  const findingsService = new FindingsService(http);
  const opensearchService = new OpenSearchService(http, savedObjects.client);
  const fieldMappingService = new FieldMappingService(http);
  const alertsService = new AlertsService(http);
  const ruleService = new RuleService(http);
  const notificationsService = new NotificationsService(http);
  const savedObjectsService = new SavedObjectService(savedObjects.client, indexService);
  const indexPatternsService = new IndexPatternsService(depsStart.data.indexPatterns);
  const logTypeService = new LogTypeService(http);
  const metricsService = new MetricsService(http);
  const threatIntelService = new ThreatIntelService(http);

  const services: BrowserServices = {
    detectorsService,
    correlationsService,
    indexService,
    fieldMappingService,
    findingsService,
    opensearchService,
    ruleService,
    alertService: alertsService,
    notificationsService,
    savedObjectsService,
    indexPatternsService,
    logTypeService,
    metricsService,
    threatIntelService,
  };

  const metrics = new MetricsContext(metricsService);

  const isDarkMode = coreStart.uiSettings.get('theme:darkMode') || false;
  DataStore.init(services, coreStart.notifications);
  DataStore.logTypes.getLogTypes().then((logTypes: LogType[]) => {
    ReactDOM.render(
      <Router>
        <Route
          render={(props) => (
            <DarkModeContext.Provider value={isDarkMode}>
              <SecurityAnalyticsContext.Provider value={{ services, metrics }}>
                <CoreServicesContext.Provider value={coreStart}>
                  <Main
                    {...props}
                    landingPage={landingPage}
                    multiDataSourceEnabled={!!depsStart.dataSource}
                    dataSourceManagement={dataSourceManagement}
                    setActionMenu={params.setHeaderActionMenu}
                  />
                </CoreServicesContext.Provider>
              </SecurityAnalyticsContext.Provider>
            </DarkModeContext.Provider>
          )}
        />
      </Router>,
      params.element
    );

    notificationsService.getServerFeatures().then((response) => {
      if (response.ok) {
        CHANNEL_TYPES.splice(0, CHANNEL_TYPES.length, ...response.response);
      }
    });

    getPlugins(opensearchService).then((plugins): void => {
      setIsNotificationPluginInstalled(plugins.includes(OS_NOTIFICATION_PLUGIN));
    });
  });

  return () => ReactDOM.unmountComponentAtNode(params.element);
}
