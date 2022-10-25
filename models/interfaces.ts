/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Rule {
  category: string;
  log_source: string;
  title: string;
  description: string;
  tags: { value: string }[];
  false_positives: { value: string }[];
  level: string;
  status: string;
  references: { value: string }[];
  author: string;
  detection: string;
}

export interface Detector {
  id?: string;
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
    unit: string;
  };
}

export interface DetectorInput {
  detector_input: {
    description: string;
    indices: string[];
    pre_packaged_rules: DetectorRuleInfo[];
    custom_rules: DetectorRuleInfo[];
  };
}

export interface DetectorRuleInfo {
  id: string;
}

export interface AlertCondition {
  // Trigger fields
  name: string;
  id?: string;

  // Detector types
  types: string[];

  // Trigger fields based on Rules
  sev_levels: string[];
  tags: string[];
  ids: string[];

  // Alert related fields
  actions: TriggerAction[];
  severity: string;
}

export interface TriggerAction {
  id: string;
  // Id of notification channel
  destination_id: string;
  subject_template: {
    source: string;
    lang: string;
  };
  name: string;
  throttle_enabled: boolean;
  message_template: {
    source: string;
    lang: string;
  };
  throttle: {
    unit: string;
    value: number;
  };
}

export interface FieldMapping {
  fieldName: string;
  aliasName: string;
}
