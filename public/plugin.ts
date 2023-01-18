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
import { PLUGIN_NAME, ROUTES } from './utils/constants';
import { SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart } from './index';
import { Plugin as DataPublicPlugin } from '../../../src/plugins/data/public';

export interface SecurityAnalyticsPluginSetupDeps {
  data: DataPublicPlugin;
}
export interface SecurityAnalyticsPluginStartDeps {
  data: DataPublicPlugin;
}

export class SecurityAnalyticsPlugin
  implements
    Plugin<
      SecurityAnalyticsPluginSetup,
      SecurityAnalyticsPluginStart,
      SecurityAnalyticsPluginSetupDeps,
      SecurityAnalyticsPluginStartDeps
    > {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  private plugins?: SecurityAnalyticsPluginStartDeps;

  public setup(
    core: CoreSetup,
    plugins: SecurityAnalyticsPluginSetupDeps
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
        const [coreStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.LANDING_PAGE, this.plugins);
      },
    });
    return {};
  }

  public start(
    core: CoreStart,
    plugins: SecurityAnalyticsPluginStartDeps
  ): SecurityAnalyticsPluginStart {
    this.plugins = plugins;
    return {};
  }
}
