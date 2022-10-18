/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FieldMappingsTableItem {
  logFieldName: string;
  siemFieldName?: string;
  status: 'unmapped' | 'mapped';
}

export interface DetectorCreationStepInfo {
  title: string;
  step: number;
}
