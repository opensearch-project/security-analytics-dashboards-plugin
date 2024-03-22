/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCondition } from './Alert';
import { DetectorRuleInfo } from './Rule';

export interface DetectorInput {
  detector_input: {
    description: string;
    indices: string[];
    pre_packaged_rules: DetectorRuleInfo[];
    custom_rules: DetectorRuleInfo[];
  };
}

export interface DetectorSchedule {
  period: {
    interval: number;
    unit: string;
  };
}

export interface Detector {
  id?: string;
  type: string;
  detector_type: string;
  name: string;
  enabled: boolean;
  createdBy: string;
  schedule: DetectorSchedule;
  inputs: DetectorInput[];
  triggers: AlertCondition[];
  threat_intel_enabled: boolean;
}

export interface AlertConditionRuleOption {
  name: string;
  id: string;
  severity: string;
  tags: string[];
}

export interface RulesSharedState {
  page: RulesPage;
  rulesOptions: AlertConditionRuleOption[];
}

export interface RulesPage {
  index: number;
}

export interface SourceIndexOption {
  label: string;
}

export enum DetectorCreationStep {
  DEFINE_DETECTOR = 1,
  CONFIGURE_ALERTS = 2,
}

export interface DetectorHit {
  _index: string;
  _source: DetectorResponse;
  _id: string;
}

/**
 * API Interfaces
 */

export type DetectorResponse = Detector & {
  last_update_time: number;
  enabled_time: number;
};

export interface CreateDetectorParams {
  body: Detector;
}

export interface CreateDetectorResponse {
  _id: string;
  _version: number;
  detector: DetectorResponse;
}

export interface GetDetectorParams {
  detectorId: string;
}

export interface GetDetectorResponse {
  _id: string;
  _version: number;
  detector: DetectorResponse;
}

export interface SearchDetectorsParams {
  body: {
    size: number;
    query: object;
  };
}

export interface SearchDetectorsResponse {
  hits: {
    total: { value: number };
    hits: DetectorHit[];
  };
}

export interface UpdateDetectorParams {
  detectorId: string;
  body: Detector;
}

export interface UpdateDetectorResponse {
  _id: string;
  _version: number;
  detector: {
    detector: Detector & {
      last_update_time: number;
      monitor_id: string;
      rule_topic_index: string;
    };
  };
}

export interface DeleteDetectorParams {
  detectorId: string;
}

export interface DeleteDetectorResponse {}
