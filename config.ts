/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema, TypeOf } from "@osd/config-schema";

export const DISABLED_SETTING_IDS = [
  "index-discarded-events",
  "index-unclassified-events",
  "index-raw-events",
] as const;

export type DisabledSettingId = (typeof DISABLED_SETTING_IDS)[number];

const disabledSettingIdsSet = new Set<string>(DISABLED_SETTING_IDS);

const disabledSettingSchema = schema.string({
  validate: (value: string) => {
    if (disabledSettingIdsSet.has(value)) {
      return;
    }
    return `invalid disabled setting '${value}', expected one of: ${DISABLED_SETTING_IDS.join(", ")}`;
  },
});

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
  // Interval in minutes at which the browser should emit the metrics to the Kibana server
  // Setting this to "0" will disable the metrics
  uxTelemetryInterval: schema.number({ defaultValue: 2 }),
  disabledSettings: schema.arrayOf(disabledSettingSchema, { defaultValue: [] }),
});

export type SecurityAnalyticsPluginConfigType = TypeOf<typeof configSchema>;
