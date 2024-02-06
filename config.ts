/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema, TypeOf } from '@osd/config-schema';

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
  // Interval in minutes at which the browser should emit the metrics to the Kibana server
  // Setting this to "0" will disable the metrics
  uxTelemetryInterval: schema.number({ defaultValue: 2 }),
});

export type SecurityAnalyticsPluginConfigType = TypeOf<typeof configSchema>;
