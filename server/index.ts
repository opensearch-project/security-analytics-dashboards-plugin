/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema, TypeOf } from '@osd/config-schema';
import { PluginConfigDescriptor, PluginInitializerContext } from '../../../src/core/server';
import { SecurityAnalyticsPlugin } from './plugin';

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
});

export type SecurityAnalyticsPluginConfigType = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<SecurityAnalyticsPluginConfigType> = {
  exposeToBrowser: {
    enabled: true,
  },
  schema: configSchema,
};

export interface SecurityAnalyticsPluginSetup {}
export interface SecurityAnalyticsPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new SecurityAnalyticsPlugin();
}
