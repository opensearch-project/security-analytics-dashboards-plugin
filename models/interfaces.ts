/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

interface RuleSource {
  source: {
    author: string;
    category: string;
    description: string;
    falsepositives: [];
    last_update_time: string;
    level: string;
    log_source: string;
    queries: [];
    references: string[];
    rule: string;
    status: string;
    tags: string[];
    title: string;
  };
}

export interface Rules {
  _id: string;
  _index: string;
  _primary_term: number;
  _score: number;
  _seq_no: number;
  source: RuleSource[];
  version: number;
}

export interface Rule {
  id: string;
  name: string;
  rule: string; // TODO: Rules will be in "sigma yaml format"
  type: string;
  active: boolean;
  description?: string;
}

export interface Detector {
  type: 'detector';
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
    unit: 'MINUTES';
  };
}

export interface DetectorInput {
  input: {
    description: string;
    indices: string[];
    rules: string[];
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

export interface FieldMapping {
  fieldName: string;
  aliasName: string;
}
