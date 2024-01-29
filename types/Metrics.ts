/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type MetricCountType = number;

export enum CreateDetectorSteps {
  notStarted = 'notStarted',
  started = 'started',
  sourceSelected = 'sourceSelected',
  logTypeConfigured = 'logTypeConfigured',
  rulesConfigured = 'rulesConfigured',
  fieldMappingsConfigured = 'fieldMappingsConfigured',
  threatIntelConfigured = 'threatIntelConfigured',
  stepTwoInitiated = 'stepTwoInitiated',
  triggerConfigured = 'triggerConfigured',
  createClicked = 'createClicked',
}

export const CreateDetectorStepValue = {
  [CreateDetectorSteps.notStarted]: 0,
  [CreateDetectorSteps.started]: 1,
  [CreateDetectorSteps.sourceSelected]: 2,
  [CreateDetectorSteps.logTypeConfigured]: 4,
  [CreateDetectorSteps.rulesConfigured]: 8,
  [CreateDetectorSteps.fieldMappingsConfigured]: 16,
  [CreateDetectorSteps.threatIntelConfigured]: 32,
  [CreateDetectorSteps.stepTwoInitiated]: 64,
  [CreateDetectorSteps.triggerConfigured]: 128,
  [CreateDetectorSteps.createClicked]: 256,
};

export interface CreateDetectorMetricsType {
  [CreateDetectorSteps.started]: MetricCountType;
  [CreateDetectorSteps.sourceSelected]: MetricCountType;
  [CreateDetectorSteps.rulesConfigured]: MetricCountType;
  [CreateDetectorSteps.fieldMappingsConfigured]: MetricCountType;
  [CreateDetectorSteps.threatIntelConfigured]: MetricCountType;
  [CreateDetectorSteps.stepTwoInitiated]: MetricCountType;
  [CreateDetectorSteps.triggerConfigured]: MetricCountType;
  [CreateDetectorSteps.createClicked]: MetricCountType;
  [logType: string]: MetricCountType;
}

export interface MetricsCounter {
  CreateDetector: CreateDetectorMetricsType;
  UpdateDetector: {};
}

export type PartialMetricsCounter = {
  [K in keyof MetricsCounter]?: Partial<MetricsCounter[K]>;
};
