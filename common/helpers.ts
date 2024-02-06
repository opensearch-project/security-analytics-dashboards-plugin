/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { DEFAULT_METRICS_COUNTER } from '../server/utils/constants';
import { MetricsCounter, PartialMetricsCounter } from '../types';
import { SecurityAnalyticsPluginConfigType } from '../config';

export function aggregateMetrics(
  metrics: PartialMetricsCounter,
  currentMetricsCounter: PartialMetricsCounter
): MetricsCounter {
  const partialMetrics: PartialMetricsCounter = {
    ...currentMetricsCounter,
  };
  Object.keys(metrics).forEach((w) => {
    const workflow = w as keyof MetricsCounter;
    const workFlowMetrics = metrics[workflow];

    if (workFlowMetrics) {
      const counterToUpdate: any =
        partialMetrics[workflow] || _.cloneDeep(DEFAULT_METRICS_COUNTER[workflow]);
      Object.entries(workFlowMetrics).forEach(([metric, count]) => {
        if (!counterToUpdate[metric]) {
          counterToUpdate[metric] = 0;
        }
        counterToUpdate[metric] += count;
      });

      partialMetrics[workflow] = counterToUpdate;
    }
  });

  return partialMetrics as MetricsCounter;
}

let securityAnalyticsPluginConfig: SecurityAnalyticsPluginConfigType;
export const setSecurityAnalyticsPluginConfig = (config: SecurityAnalyticsPluginConfigType) => {
  securityAnalyticsPluginConfig = config;
};

export const getSecurityAnalyticsPluginConfig = () => securityAnalyticsPluginConfig;
