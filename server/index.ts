/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginConfigDescriptor, PluginInitializerContext } from 'opensearch-dashboards/server';
import { SecurityAnalyticsPlugin } from './plugin';
import { Observable } from 'rxjs';
import { SecurityAnalyticsPluginConfigType, configSchema } from '../config';

export const config: PluginConfigDescriptor<SecurityAnalyticsPluginConfigType> = {
  exposeToBrowser: {
    enabled: true,
    uxTelemetryInterval: true,
  },
  schema: configSchema,
};
export interface SecurityAnalyticsPluginSetup {
  config$: Observable<SecurityAnalyticsPluginConfigType>;
}
export interface SecurityAnalyticsPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new SecurityAnalyticsPlugin(initializerContext);
}
