/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { DEFAULT_METRICS_COUNTER } from '../server/utils/constants';
import { MetricsCounter, PartialMetricsCounter, PromoteSpaces, Space } from '../types';
import { SecurityAnalyticsPluginConfigType } from '../config';
import { Get, Set } from '../../../src/plugins/opensearch_dashboards_utils/common';
// Wazuh
import { AllowedActionsBySpace, SpaceTypes, UserSpacesOrder } from './constants';

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

export const getSecurityAnalyticsPluginConfig = (): SecurityAnalyticsPluginConfigType | undefined =>
  securityAnalyticsPluginConfig;

export function extractFieldsFromMappings(
  properties: any,
  fields: string[],
  parentField: string = ''
) {
  Object.keys(properties).forEach((field) => {
    if (properties[field].hasOwnProperty('properties')) {
      extractFieldsFromMappings(
        properties[field]['properties'],
        fields,
        parentField ? `${parentField}.${field}` : field
      );
    } else {
      fields.push(parentField ? `${parentField}.${field}` : field);
    }
  });
}

export function createNullableGetterSetter<T>(): [Get<T | undefined>, Set<T>] {
  let value: T;

  const get = () => {
    return value;
  };

  const set = (newValue: T) => {
    value = newValue;
  };

  return [get, set];
}

// Wazuh
export function actionIsAllowedOnSpace(space: Space, action: string): Boolean {
  return AllowedActionsBySpace?.[SpaceTypes[space.toUpperCase()]?.value]?.includes(action);
}

export function getSpacesAllowAction(action: string): Space[] {
  return Object.entries(AllowedActionsBySpace)
    .filter(([_, allowedActions]) => allowedActions.includes(action))
    .map(([space]) => space) as Space[];
}

export const getNextSpace = (space: PromoteSpaces) => {
  const currentIndex = UserSpacesOrder.indexOf(space);
  if (currentIndex === -1 || currentIndex === UserSpacesOrder.length - 1) {
    return null; // No next space available
  }
  return UserSpacesOrder[currentIndex + 1];
};
