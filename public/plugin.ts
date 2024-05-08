/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  Plugin,
  PluginInitializerContext,
} from '../../../src/core/public';
import { PLUGIN_NAME, ROUTES, setDarkMode } from './utils/constants';
import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from './index';
import { DataPublicPluginStart, DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { SecurityAnalyticsPluginConfigType } from '../config';
import { setSecurityAnalyticsPluginConfig } from '../common/helpers';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { DataSourcePluginStart } from '../../../src/plugins/data_source/public';

export interface SecurityAnalyticsPluginSetupDeps {
  data: DataPublicPluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}
export interface SecurityAnalyticsPluginStartDeps {
  data: DataPublicPluginStart;
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
    setDarkMode(core.uiSettings.get('theme:darkMode'));

    const config = this.initializerContext.config.get();
    setSecurityAnalyticsPluginConfig(config);

    return {
      config,
    };
  }

  public start(_core: CoreStart): SecurityAnalyticsPluginStart {
    return {};
  }
}
