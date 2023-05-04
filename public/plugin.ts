/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { PLUGIN_NAME, ROUTES, setDarkMode } from './utils/constants';
import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from './index';
import { DataPublicPluginStart, DataPublicPluginSetup } from '../../../src/plugins/data/public';

export interface SecurityAnalyticsPluginSetupDeps {
  data: DataPublicPluginSetup;
}
export interface SecurityAnalyticsPluginStartDeps {
  data: DataPublicPluginStart;
}

export class SecurityAnalyticsPlugin
  implements
    Plugin<
      SecurityAnalyticsPluginSetup,
      SecurityAnalyticsPluginStart,
      SecurityAnalyticsPluginSetupDeps,
      SecurityAnalyticsPluginStartDeps
    > {
  public setup(
    core: CoreSetup<SecurityAnalyticsPluginStartDeps>,
    _plugins: SecurityAnalyticsPluginSetupDeps
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
        return renderApp(coreStart, params, ROUTES.LANDING_PAGE, depsStart);
      },
    });
    setDarkMode(core.uiSettings.get('theme:darkMode'));

    return {};
  }

  public start(_core: CoreStart): SecurityAnalyticsPluginStart {
    return {};
  }
}
