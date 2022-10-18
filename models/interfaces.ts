/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Detector {
  type: string;
  detector_type: string;
  name: string;
  enabled: boolean;
  createdBy: string;
  schedule: PeriodSchedule;
  inputs: DetectorInput[];
  triggers: AlertCondition[];
}

export interface PeriodSchedule {
  period: {
    interval: number;
    unit: string;
  };
}

export interface DetectorInput {
  input: {
    description: string;
    indices: string[];
    enabledCustomRuleIds: string[];
  };
}

export interface Rule {
  id: string;
  name: string;
  rule: string; // TODO: Rules will be in "sigma yaml format"
  type: string;
  active: boolean;
  description?: string;
}

export interface AlertCondition {
  sev_levels: string[];
  tags: string[];
  actions: string[];
  types: string[];
  name: string;
  id?: string;
}
