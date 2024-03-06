/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Edge, GraphEvents, Node } from 'react-graph-vis';
import { FilterItem } from '../public/pages/Correlations/components/FilterGroup';
import { Query } from '@opensearch-project/oui/src/eui_components/search_bar/search_bar';
import { RuleInfo } from './Rule';
import { DetectorHit } from './Detector';

export enum CorrelationsLevel {
  AllFindings = 'AllFindings',
  Finding = 'Finding',
}

export type CorrelationRuleAction = 'Create' | 'Edit' | 'Readonly';

export interface CorrelationGraphData {
  graph: {
    nodes: (Node & { chosen?: boolean; saLogType: string })[];
    edges: Edge[];
  };
  events: GraphEvents;
}

export type CorrelationFinding = {
  id: string;
  correlationScore?: string;
  correlationRule?: CorrelationRule;
  logType: string;
  timestamp: string;
  detectionRule: { name: string; severity: string };
  detectorName?: string;
  rules?: string[];
  detector?: DetectorHit;
};

export interface CorrelationRuleQuery {
  logType: string;
  index: string;
  field: string;
  conditions: CorrelationFieldCondition[];
}

export interface CorrelationFieldCondition {
  name: string;
  value: any;
  condition: 'AND' | 'OR';
}

export interface CorrelationRuleModel {
  name: string;
  time_window: number; // Time in milliseconds
  queries: CorrelationRuleQuery[];
}

export interface CorrelationRule extends CorrelationRuleModel {
  id: string;
}

export interface CorrelationRuleTableItem extends CorrelationRule {
  logTypes: string;
}

export interface CorrelationRuleSourceQueries {
  index: string;
  query: string;
  field: string;
  category: string;
}

export interface CorrelationRuleSource {
  name: string;
  time_window: number;
  correlate: CorrelationRuleSourceQueries[];
}

export interface CorrelationRuleHit {
  _index: string;
  _id: string;
  _version: number;
  _seq_no: number;
  _primary_term: number;
  _score: number;
  _source: CorrelationRuleSource;
}

export interface SearchCorrelationRulesResponse {
  hits: {
    total: { value: number };
    hits: CorrelationRuleHit[];
  };
}

export interface CorrelationFindingHit {
  finding: string;
  detector_type: string;
  score: number;
  rules: string[];
}
export interface GetCorrelationFindingsResponse {
  findings: CorrelationFindingHit[];
}

export interface GetAllCorrelationsInTimeRangeResponse {
  findings: {
    finding1: string;
    logType1: string;
    finding2: string;
    logType2: string;
  }[];
}

export interface CreateCorrelationRuleResponse {
  rule: CorrelationRuleSource;
  _id: string;
  _version: number;
}

export interface UpdateCorrelationRuleResponse extends CreateCorrelationRuleResponse {}

export interface DeleteCorrelationRuleResponse {}

export interface ICorrelationsStore {
  getCorrelationRules(): Promise<CorrelationRule[]>;
  getCorrelatedFindings(
    finding: string,
    detector_type: string,
    nearby_findings?: number
  ): Promise<{ finding: CorrelationFinding; correlatedFindings: CorrelationFinding[] }>;
  createCorrelationRule(correlationRule: CorrelationRule): void;
  updateCorrelationRule(correlationRule: CorrelationRule): void;
  deleteCorrelationRule(ruleId: string): Promise<boolean>;
  getAllCorrelationsInWindow(
    start_time: string,
    end_time: string
  ): Promise<{ finding1: CorrelationFinding; finding2: CorrelationFinding }[]>;
  allFindings: { [id: string]: CorrelationFinding };
  fetchAllFindings(): Promise<{ [id: string]: CorrelationFinding }>;
}

export type CorrelationLevelInfo =
  | {
      level: CorrelationsLevel.AllFindings;
      logTypeFilterItems?: FilterItem[];
    }
  | {
      level: CorrelationsLevel.Finding;
      findingId: string;
    };

export interface ArgsWithQuery {
  query: Query;
  queryText: string;
  error: null;
}

export interface ArgsWithError {
  query: null;
  queryText: string;
  error: Error;
}

export interface GetCorrelationRulesResponse {
  hits: {
    hits: RuleInfo[];
    total: {
      value: number;
      relation: string;
    };
    timed_out: boolean;
  };
}

export interface GetCorrelationFindingsParams {
  finding: string;
  detector_type: string;
  nearby_findings?: number;
}
