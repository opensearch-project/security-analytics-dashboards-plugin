/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DetectorCreationStep {
  DEFINE_DETECTOR = 1,
  CONFIGURE_ALERTS = 2,
  REVIEW_CREATE = 3,
}

export interface DefineDetectorData {
  name: string;
  description: string;
  inputIndices: string[];
  detectorType: string;
}

export interface ConfigureFieldMappingData {
  name: string;
  description: string;
  inputIndices: string[];
  detectorType: string;
}

export interface ConfigureAlertsData {
  name: string;
  description: string;
  inputIndices: string[];
  detectorType: string;
}

export interface ReviewAndCreateData {
  name: string;
  description: string;
  inputIndices: string[];
  detectorType: string;
}

export interface DetectorDataByStep {
  [DetectorCreationStep.DEFINE_DETECTOR]: DefineDetectorData;
  [DetectorCreationStep.CONFIGURE_ALERTS]: ConfigureAlertsData;
  [DetectorCreationStep.REVIEW_CREATE]: ReviewAndCreateData;
}

export type DetectorData<T extends DetectorCreationStep> = {
  step: T;
  data: DetectorDataByStep[T];
};
