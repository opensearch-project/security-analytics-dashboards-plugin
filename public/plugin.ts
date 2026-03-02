/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  AppUpdater,
  CoreSetup,
  CoreStart,
  DEFAULT_NAV_GROUPS,
  Plugin,
  PluginInitializerContext,
  AppNavLinkStatus
} from '../../../src/core/public';
import {
  // Wazuh: hide Correlations app in Security Analytics nav.
  // CORRELATIONS_NAV_ID,
  // Wazuh: hide Correlation rules app in Security Analytics nav.
  // CORRELATIONS_RULE_NAV_ID,
  DETECTORS_NAV_ID,
  DETECTION_RULE_NAV_ID,
  FINDINGS_NAV_ID,
  // Wazuh: hide Insights category (keep Findings at root).
  // INSIGHTS_NAV_ID,
  INTEGRATIONS_NAV_ID,
  LOG_TYPES_NAV_ID,
  OVERVIEW_NAV_ID,
  PLUGIN_NAME,
  ROUTES,
  // Wazuh: hide Alerts app in Security Analytics nav.
  // THREAT_ALERTS_NAV_ID,
  dataSourceObservable,
  setDarkMode,
  DETECTION_NAV_ID,
  NORMALIZATION_NAV_ID,
  DECODERS_NAV_ID,
  KVDBS_NAV_ID,
  LOG_TEST_NAV_ID,
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
  setChrome,
  setContentManagement,
  setDataSourceManagementPlugin,
  setNotifications,
  setSavedObjectsClient,
} from './services/utils/constants';
import { initializeServices } from './utils/helpers';
// Wazuh: hide Threat Alerts overview card registration.
// import { registerThreatAlertsCard } from './utils/helpers';
import { BehaviorSubject } from 'rxjs';

export interface SecurityAnalyticsPluginSetupDeps {
  data: DataPublicPluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
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
  ) { }

  private updateDefaultRouteOfManagementApplications: AppUpdater = () => {
    const dataSourceValue = dataSourceObservable.value?.id;
    let hash = `#/`;
    /***
     When data source value is undefined,
     it means the data source picker has not determined which data source to use(local or default data source)
     so we should not append any data source id into hash to avoid impacting the data source picker.
     **/
    if (dataSourceValue !== undefined) {
      hash = `#/?dataSourceId=${dataSourceValue}`;
    }
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

    // <- Main menu Security Analytics created with sub-menus for each section
    core.application.register({
      id: PLUGIN_NAME,
      title: 'Security Analytics',
      order: 7000,
      category: {
        id: 'security_analytics',
        label: 'Security analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      navLinkStatus: AppNavLinkStatus.hidden,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import('./security_analytics_app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.LANDING_PAGE, depsStart, dataSourceManagement);
      },
    });

    core.application.register({
      id: OVERVIEW_NAV_ID,
      title: 'Overview',
      order: 7000,
      category: {
        id: 'security_analytics',
        label: 'Security analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import('./security_analytics_app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.LANDING_PAGE, depsStart, dataSourceManagement);
      },
    });

    core.application.register({
      id: FINDINGS_NAV_ID,
      title: 'Findings',
      order: 7001,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.FINDINGS);
      },
    });

    // Wazuh: hide Alerts app from the Security Analytics navigation.
    // core.application.register({
    //   id: THREAT_ALERTS_NAV_ID,
    //   title: 'Alerts',
    //   order: 7002,
    //   category: {
    //     id: 'security_analytics',
    //     label: 'Security Analytics',
    //     order: 550,
    //     euiIconType: 'securityAnalyticsApp',
    //   },
    //   updater$: this.appStateUpdater,
    //   mount: async (params: AppMountParameters) => {
    //     return mountWrapper(params, ROUTES.ALERTS);
    //   },
    // });

    // Wazuh: hide Correlations app from the Security Analytics navigation.
    // core.application.register({
    //   id: CORRELATIONS_NAV_ID,
    //   title: 'Correlations',
    //   order: 7003,
    //   category: {
    //     id: 'security_analytics',
    //     label: 'Security Analytics',
    //     order: 550,
    //     euiIconType: 'securityAnalyticsApp',
    //   },
    //   updater$: this.appStateUpdater,
    //   mount: async (params: AppMountParameters) => {
    //     return mountWrapper(params, ROUTES.CORRELATIONS);
    //   },
    // });

    core.application.register({
      id: INTEGRATIONS_NAV_ID,
      title: 'Integrations',
      order: 7004,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.INTEGRATIONS);
      },
    });

    core.application.register({
      id: DECODERS_NAV_ID,
      title: 'Decoders',
      order: 7006,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.DECODERS);
      },
    });
    
    core.application.register({
      id: KVDBS_NAV_ID,
      title: 'KVDBs',
      order: 7007,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.KVDBS);
      },
    });

    core.application.register({
      id: LOG_TEST_NAV_ID,
      title: 'Log test',
      order: 7011,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.LOG_TEST);
      },
    });

    core.application.register({
      id: DETECTORS_NAV_ID,
      title: 'Detectors',
      order: 7009,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.DETECTORS);
      },
    });

    core.application.register({
      id: DETECTION_RULE_NAV_ID,
      title: 'Detection rules',
      order: 7010,
      category: {
        id: 'security_analytics',
        label: 'Security Analytics',
        order: 550,
        euiIconType: 'securityAnalyticsApp',
      },
      updater$: this.appStateUpdater,
      mount: async (params: AppMountParameters) => {
        return mountWrapper(params, ROUTES.RULES);
      },
    });

    // Wazuh: hide Correlation rules app from the Security Analytics navigation.
    // core.application.register({
    //   id: CORRELATIONS_RULE_NAV_ID,
    //   title: 'Correlation rules',
    //   order: 7011,
    //   category: {
    //     id: 'security_analytics',
    //     label: 'Security Analytics',
    //     order: 550,
    //     euiIconType: 'securityAnalyticsApp',
    //   },
    //   updater$: this.appStateUpdater,
    //   mount: async (params: AppMountParameters) => {
    //     return mountWrapper(params, ROUTES.CORRELATION_RULES);
    //   },
    // });

    // Main menu Security Analytics created with sub-menus for each section ->
    if (core.chrome.navGroup.getNavGroupEnabled()) {
      dataSourceObservable.subscribe((dataSourceOption) => {
        if (dataSourceOption) {
          this.appStateUpdater.next(this.updateDefaultRouteOfManagementApplications);
        }
      });

      // Wazuh: hide Insights category and keep Findings at root.
      // core.application.register({
      //   id: INSIGHTS_NAV_ID,
      //   title: "Insights",
      //   mount: async () => {
      //     return () => {};
      //   }
      // })

      // Wazuh: register an empty app to allow the nested apps in the sidebar menu
      core.application.register({
        id: DETECTION_NAV_ID,
        title: "Detection",
        mount: async () => {
          return () => {};
        }
      })

      // Wazuh: register an empty app to allow the nested apps in the sidebar menu
      core.application.register({
        id: NORMALIZATION_NAV_ID,
        title: "Normalization",
        mount: async () => {
          return () => {};
        }
      })

      const navlinks = [
        { id: OVERVIEW_NAV_ID, showInAllNavGroup: true },
        // Wazuh does not use Get Started page
        // { id: GET_STARTED_NAV_ID, showInAllNavGroup: true },
        // Wazuh: hide Insights category and its sub-items (Alerts/Correlations).
        // {
        //   id: INSIGHTS_NAV_ID,
        //   title: "Insights",
        //   showInAllNavGroup: true,
        //   order: 7001,
        // },
        // { id: THREAT_ALERTS_NAV_ID, parentNavLinkId: INSIGHTS_NAV_ID, showInAllNavGroup: true },
        // { id: FINDINGS_NAV_ID, parentNavLinkId: INSIGHTS_NAV_ID, showInAllNavGroup: true },
        // { id: CORRELATIONS_NAV_ID, parentNavLinkId: INSIGHTS_NAV_ID, showInAllNavGroup: true },
        { id: FINDINGS_NAV_ID, showInAllNavGroup: true, order: 7001 },
        { id: LOG_TYPES_NAV_ID, showInAllNavGroup: true, order: 7004 },
        {
          id: NORMALIZATION_NAV_ID,
          title: "Normalization",
          showInAllNavGroup: true,
          order: 7003,
        },
        {
          id: DECODERS_NAV_ID,
          parentNavLinkId: NORMALIZATION_NAV_ID,
          showInAllNavGroup: true,
          order: 7006,
        },
        {
          id: KVDBS_NAV_ID,
          parentNavLinkId: NORMALIZATION_NAV_ID,
          showInAllNavGroup: true,
          order: 7007,
        },
        {
          id: DETECTION_NAV_ID,
          title: "Detection",
          showInAllNavGroup: true,
          order: 7009,
        },
        { id: DETECTORS_NAV_ID, parentNavLinkId: DETECTION_NAV_ID, showInAllNavGroup: true },
        { id: DETECTION_RULE_NAV_ID, parentNavLinkId: DETECTION_NAV_ID, showInAllNavGroup: true },
        // Wazuh: hide Correlation rules from Detection category.
        // { id: CORRELATIONS_RULE_NAV_ID, parentNavLinkId: DETECTION_NAV_ID, showInAllNavGroup: true },
        // Wazuh does not use Threat Intelligence
        // { id: THREAT_INTEL_NAV_ID, showInAllNavGroup: true },
        { id: LOG_TEST_NAV_ID, showInAllNavGroup: true, order: 7011 },
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
    setChrome(core.chrome);
    setContentManagement(contentManagement);
    setNotifications(core.notifications);
    setSavedObjectsClient(core.savedObjects.client);
    initializeServices(core, data.indexPatterns, data.search);
    // Wazuh: hide Threat Alerts overview card.
    // registerThreatAlertsCard();

    return {};
  }
}
