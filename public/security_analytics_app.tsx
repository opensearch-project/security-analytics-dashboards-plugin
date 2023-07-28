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
  ServicesContext,
  IndexPatternsService,
  LogTypeService,
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
import { ruleTypes } from './pages/Rules/utils/constants';

export function renderApp(
  coreStart: CoreStart,
  params: AppMountParameters,
  landingPage: string,
  depsStart: SecurityAnalyticsPluginStartDeps
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
  };

  const isDarkMode = coreStart.uiSettings.get('theme:darkMode') || false;
  DataStore.init(services, coreStart.notifications);
  DataStore.logTypes.getLogTypes().then((logTypes: LogType[]) => {
    ruleTypes.splice(
      0,
      0,
      ...logTypes.map((logType) => ({
        label: logType.name,
        value: logType.id,
        abbr: '',
      }))
    );

    ReactDOM.render(
      <Router>
        <Route
          render={(props) => (
            <DarkModeContext.Provider value={isDarkMode}>
              <ServicesContext.Provider value={services}>
                <CoreServicesContext.Provider value={coreStart}>
                  <Main {...props} landingPage={landingPage} />
                </CoreServicesContext.Provider>
              </ServicesContext.Provider>
            </DarkModeContext.Provider>
          )}
        />
      </Router>,
      params.element
    );
  });

  return () => ReactDOM.unmountComponentAtNode(params.element);
}
