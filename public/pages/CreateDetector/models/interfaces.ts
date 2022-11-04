/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FieldMappingsTableItem {
  ruleFieldName: string;
  logFieldName?: string;
}

export interface DetectorCreationStepInfo {
  title: string;
  step: number;
}
