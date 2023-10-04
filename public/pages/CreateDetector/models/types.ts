/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorCreationStep } from '../../../../types';

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

export interface DetectorDataByStep {
  [DetectorCreationStep.DEFINE_DETECTOR]: DefineDetectorData;
  [DetectorCreationStep.CONFIGURE_ALERTS]: ConfigureAlertsData;
}

export type DetectorData<T extends DetectorCreationStep> = {
  step: T;
  data: DetectorDataByStep[T];
};
