/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Edge, GraphEvents, Node } from 'react-graph-vis';
import { FilterItem } from '../public/pages/Correlations/components/FilterGroup';
import { Query } from '@opensearch-project/oui/src/eui_components/search_bar/search_bar';
import { RuleInfo } from './Rule';

export enum CorrelationsLevel {
  AllFindings = 'AllFindings',
  Finding = 'Finding',
}

export interface CorrelationGraphData {
  graph: {
    nodes: (Node & { chosen?: boolean })[];
    edges: Edge[];
  };
  events: GraphEvents;
}

export type CorrelationGraphUpdateHandler = (newGraphData: CorrelationGraphData) => void;
export type CorrelationGraphEventHandler = (eventParams: any) => void;
export type CorrelationFinding = {
  id: string;
  correlationScore?: number;
  logType: string;
  timestamp: string;
  detectionRule: { name: string; severity: string };
};

export interface CorrelationRuleQuery {
  logType: string;
  index: string;
  conditions: CorrelationFieldCondition[];
}

export interface CorrelationFieldCondition {
  name: string;
  value: any;
  condition: 'AND' | 'OR';
}

export interface CorrelationRule extends CorrelationRuleModel {
  id: string;
}

export interface CorrelationRuleModel {
  name: string;
  queries: CorrelationRuleQuery[];
}

export interface CorrelationRuleSourceQueries {
  index: string;
  query: string;
  category: string;
}

export interface CorrelationRuleSource {
  name: string;
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

export interface CreateCorrelationRuleResponse {
  rule: CorrelationRuleSource;
  _id: string;
  _version: number;
}

export interface DeleteCorrelationRuleResponse {}

export type CorrelationRuleTableItem = CorrelationRule & { logTypes: string };

export interface ICorrelationsStore {
  getCorrelationRules(): Promise<CorrelationRuleHit[]>;
  createCorrelationRule(correlationRule: CorrelationRule): void;
  deleteCorrelationRule(ruleId: string): Promise<boolean>;
  registerGraphEventHandler(event: string, handler: CorrelationGraphEventHandler): void;
  getAllFindings(): { [id: string]: CorrelationFinding };

  getAllCorrelationsInWindow(
    timeWindow?: any
  ): { finding1: CorrelationFinding; finding2: CorrelationFinding }[];
  getCorrelatedFindings(
    findingId: string
  ): { finding: CorrelationFinding; correlatedFindings: CorrelationFinding[] };
  allFindings: { [id: string]: CorrelationFinding };
  fetchAllFindings(): { [id: string]: CorrelationFinding };
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
