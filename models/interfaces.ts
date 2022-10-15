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
    rules: Rule[];
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
  name: string;
  rule_types: string[];
  severity: string[];
  tags: string[];
  notification_channel_ids: string[];
}
