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

export class SecurityAnalyticsPlugin
  implements Plugin<SecurityAnalyticsPluginSetup, SecurityAnalyticsPluginStart> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup): SecurityAnalyticsPluginSetup {
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
        return renderApp(coreStart, params, ROUTES.LANDING_PAGE);
      },
    });
    return {};
  }

  public start(core: CoreStart): SecurityAnalyticsPluginStart {
    return {};
  }
}
