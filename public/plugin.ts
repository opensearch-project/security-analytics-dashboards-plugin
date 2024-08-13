/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
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
  DETECTORS_RULE_NAV_ID,
  FINDINGS_NAV_ID,
  LOG_TYPES_NAV_ID,
  OVERVIEW_NAV_ID,
  PLUGIN_NAME,
  ROUTES,
  THREAT_ALERTS_NAV_ID,
  THREAT_INTEL_NAV_ID,
  setApplication,
  setBreadCrumbsSetter,
  setDarkMode,
  setNavigationUI,
  setUISettings,
} from './utils/constants';
import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from './index';
import { DataPublicPluginStart, DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { SecurityAnalyticsPluginConfigType } from '../config';
import { setSecurityAnalyticsPluginConfig } from '../common/helpers';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { DataSourcePluginStart } from '../../../src/plugins/data_source/public';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';

export interface SecurityAnalyticsPluginSetupDeps {
  data: DataPublicPluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}
export interface SecurityAnalyticsPluginStartDeps {
  data: DataPublicPluginStart;
  navigation: NavigationPublicPluginStart;
  dataSource?: DataSourcePluginStart;
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
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.LANDING_PAGE);
        },
      });

      core.application.register({
        id: THREAT_ALERTS_NAV_ID,
        title: 'Threat alerts',
        order: 9070,
        category: DEFAULT_APP_CATEGORIES.investigate,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.ALERTS);
        },
      });

      core.application.register({
        id: FINDINGS_NAV_ID,
        title: 'Findings',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.investigate,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.FINDINGS);
        },
      });

      core.application.register({
        id: CORRELATIONS_NAV_ID,
        title: 'Correlations',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.investigate,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.CORRELATIONS);
        },
      });

      core.application.register({
        id: DETECTORS_NAV_ID,
        title: 'Threat detectors',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.configure,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.DETECTORS);
        },
      });

      core.application.register({
        id: DETECTORS_RULE_NAV_ID,
        title: 'Detection rules',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.configure,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.RULES);
        },
      });

      core.application.register({
        id: CORRELATIONS_RULE_NAV_ID,
        title: 'Correlation rules',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.configure,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.CORRELATION_RULES);
        },
      });

      core.application.register({
        id: THREAT_INTEL_NAV_ID,
        title: 'Threat intelligence',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.configure,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.THREAT_INTEL_OVERVIEW);
        },
      });

      core.application.register({
        id: LOG_TYPES_NAV_ID,
        title: 'Log types',
        order: 9080,
        category: DEFAULT_APP_CATEGORIES.configure,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.LOG_TYPES);
        },
      });

      const navlinks = [
        { id: OVERVIEW_NAV_ID, showInAllNavGroup: true },
        { id: THREAT_ALERTS_NAV_ID, showInAllNavGroup: true },
        { id: FINDINGS_NAV_ID, showInAllNavGroup: true },
        { id: CORRELATIONS_NAV_ID },
        { id: PLUGIN_NAME, category: DEFAULT_APP_CATEGORIES.configure, title: 'Threat detection' },
        { id: DETECTORS_NAV_ID, parentNavLinkId: PLUGIN_NAME },
        { id: DETECTORS_RULE_NAV_ID, parentNavLinkId: PLUGIN_NAME },
        { id: CORRELATIONS_RULE_NAV_ID },
        { id: THREAT_INTEL_NAV_ID},
        { id: LOG_TYPES_NAV_ID }
      ];

      core.chrome.navGroup.addNavLinksToGroup(
        DEFAULT_NAV_GROUPS['security-analytics'],
        navlinks
      );
    }

    setDarkMode(core.uiSettings.get('theme:darkMode'));

    const config = this.initializerContext.config.get();
    setSecurityAnalyticsPluginConfig(config);

    return {
      config,
    };
  }

  public start(
    core: CoreStart,
    { navigation }: SecurityAnalyticsPluginStartDeps
  ): SecurityAnalyticsPluginStart {
    setUISettings(core.uiSettings);
    setNavigationUI(navigation.ui);
    setApplication(core.application);
    setBreadCrumbsSetter(core.chrome.setBreadcrumbs);
    return {};
  }
}
