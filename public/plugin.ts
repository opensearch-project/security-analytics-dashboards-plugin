/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  AppUpdater,
  CoreSetup,
  CoreStart,
  DEFAULT_APP_CATEGORIES,
  DEFAULT_NAV_GROUPS,
  Plugin,
  PluginInitializerContext,
} from '../../../src/core/public';
import {
  CORRELATIONS_NAV_ID,
  CORRELATIONS_RULE_NAV_ID,
  DETECTORS_NAV_ID,
  DETECTION_RULE_NAV_ID,
  FINDINGS_NAV_ID,
  GET_STARTED_NAV_ID,
  LOG_TYPES_NAV_ID,
  OVERVIEW_NAV_ID,
  PLUGIN_NAME,
  ROUTES,
  THREAT_ALERTS_NAV_ID,
  THREAT_INTEL_NAV_ID,
  dataSourceObservable,
  setDarkMode,
} from './utils/constants';
import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from './index';
import { DataPublicPluginStart, DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { SecurityAnalyticsPluginConfigType } from '../config';
import { setSecurityAnalyticsPluginConfig } from '../common/helpers';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { DataSourcePluginStart } from '../../../src/plugins/data_source/public';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { ContentManagementPluginStart } from 'src/plugins/content_management/public';
import {
  setUISettings,
  setNavigationUI,
  setApplication,
  setBreadCrumbsSetter,
  setContentManagement,
  setDataSourceManagementPlugin,
  setNotifications,
  setSavedObjectsClient,
} from './services/utils/constants';
import { initializeServices, registerThreatAlertsCard } from './utils/helpers';
import { BehaviorSubject } from 'rxjs';

export interface SecurityAnalyticsPluginSetupDeps {
  data: DataPublicPluginSetup;
  dataSourceManagement: DataSourceManagementPluginSetup;
}
export interface SecurityAnalyticsPluginStartDeps {
  data: DataPublicPluginStart;
  navigation: NavigationPublicPluginStart;
  dataSource?: DataSourcePluginStart;
  contentManagement: ContentManagementPluginStart;
}

export class SecurityAnalyticsPlugin
  implements
    Plugin<
      SecurityAnalyticsPluginSetup,
      SecurityAnalyticsPluginStart,
      SecurityAnalyticsPluginSetupDeps,
      SecurityAnalyticsPluginStartDeps
    > {
  public constructor(
    private initializerContext: PluginInitializerContext<SecurityAnalyticsPluginConfigType>
  ) {}

  private updateDefaultRouteOfManagementApplications: AppUpdater = () => {
    const hash = `#/?dataSourceId=${dataSourceObservable.value?.id || ''}`;
    return {
      defaultPath: hash,
    };
  };

  private appStateUpdater = new BehaviorSubject<AppUpdater>(
    this.updateDefaultRouteOfManagementApplications
  );

  public setup(
    core: CoreSetup<SecurityAnalyticsPluginStartDeps>,
    { dataSourceManagement }: SecurityAnalyticsPluginSetupDeps
  ): SecurityAnalyticsPluginSetup {
    const mountWrapper = async (params: AppMountParameters, redirect: string) => {
      const { renderApp } = await import('./security_analytics_app');
      const [coreStart, depsStart] = await core.getStartServices();
      return renderApp(coreStart, params, redirect, depsStart, dataSourceManagement);
    };

    core.application.register({
      id: PLUGIN_NAME,
      title: 'Security Analytics',
      order: 7000,
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import('./security_analytics_app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.LANDING_PAGE, depsStart, dataSourceManagement);
      },
    });

    if (core.chrome.navGroup.getNavGroupEnabled()) {
      core.application.register({
        id: OVERVIEW_NAV_ID,
        title: 'Overview',
        order: 0,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.LANDING_PAGE);
        },
      });

      core.application.register({
        id: GET_STARTED_NAV_ID,
        title: 'Get started',
        order: 1,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.GETTING_STARTED);
        },
      });

      core.application.register({
        id: THREAT_ALERTS_NAV_ID,
        title: 'Threat alerts',
        order: 300,
        category: DEFAULT_APP_CATEGORIES.investigate,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.ALERTS);
        },
      });

      core.application.register({
        id: FINDINGS_NAV_ID,
        title: 'Findings',
        order: 400,
        category: DEFAULT_APP_CATEGORIES.investigate,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.FINDINGS);
        },
      });

      core.application.register({
        id: CORRELATIONS_NAV_ID,
        title: 'Correlations',
        order: 500,
        category: DEFAULT_APP_CATEGORIES.investigate,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.CORRELATIONS);
        },
      });

      core.application.register({
        id: DETECTORS_NAV_ID,
        title: 'Threat detectors',
        order: 600,
        category: DEFAULT_APP_CATEGORIES.configure,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.DETECTORS);
        },
      });

      core.application.register({
        id: DETECTION_RULE_NAV_ID,
        title: 'Detection rules',
        order: 700,
        category: DEFAULT_APP_CATEGORIES.configure,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.RULES);
        },
      });

      core.application.register({
        id: CORRELATIONS_RULE_NAV_ID,
        title: 'Correlation rules',
        order: 800,
        category: DEFAULT_APP_CATEGORIES.configure,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.CORRELATION_RULES);
        },
      });

      core.application.register({
        id: THREAT_INTEL_NAV_ID,
        title: 'Threat intelligence',
        order: 900,
        category: DEFAULT_APP_CATEGORIES.configure,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.THREAT_INTEL_OVERVIEW);
        },
      });

      core.application.register({
        id: LOG_TYPES_NAV_ID,
        title: 'Log types',
        order: 1000,
        category: DEFAULT_APP_CATEGORIES.configure,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.LOG_TYPES);
        },
      });

      dataSourceObservable.subscribe((dataSourceOption) => {
        if (dataSourceOption) {
          this.appStateUpdater.next(this.updateDefaultRouteOfManagementApplications);
        }
      });

      const navlinks = [
        { id: OVERVIEW_NAV_ID, showInAllNavGroup: true },
        { id: GET_STARTED_NAV_ID, showInAllNavGroup: true },
        { id: THREAT_ALERTS_NAV_ID, showInAllNavGroup: true },
        { id: FINDINGS_NAV_ID, showInAllNavGroup: true },
        { id: CORRELATIONS_NAV_ID, showInAllNavGroup: true },
        { id: PLUGIN_NAME, category: DEFAULT_APP_CATEGORIES.configure, title: 'Threat detection', showInAllNavGroup: true, order: 600 },
        { id: DETECTORS_NAV_ID, parentNavLinkId: PLUGIN_NAME, showInAllNavGroup: true },
        { id: DETECTION_RULE_NAV_ID, parentNavLinkId: PLUGIN_NAME, showInAllNavGroup: true },
        { id: CORRELATIONS_RULE_NAV_ID, showInAllNavGroup: true },
        { id: THREAT_INTEL_NAV_ID, showInAllNavGroup: true },
        { id: LOG_TYPES_NAV_ID, showInAllNavGroup: true },
      ];

      core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS['security-analytics'], navlinks);
    }

    setDarkMode(core.uiSettings.get('theme:darkMode'));

    const config = this.initializerContext.config.get();
    setSecurityAnalyticsPluginConfig(config);
    setDataSourceManagementPlugin(dataSourceManagement);

    return {
      config,
    };
  }

  public start(
    core: CoreStart,
    { navigation, contentManagement, data }: SecurityAnalyticsPluginStartDeps
  ): SecurityAnalyticsPluginStart {
    setUISettings(core.uiSettings);
    setNavigationUI(navigation.ui);
    setApplication(core.application);
    setBreadCrumbsSetter(core.chrome.setBreadcrumbs);
    setContentManagement(contentManagement);
    setNotifications(core.notifications);
    setSavedObjectsClient(core.savedObjects.client);
    initializeServices(core, data.indexPatterns);
    registerThreatAlertsCard();

    return {};
  }
}
