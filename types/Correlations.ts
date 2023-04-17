/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// import { Edge, GraphEvents, Node } from 'react-graph-vis';
import { FilterItem } from '../public/pages/Correlations/components/LogTypeFilterGroup';
import { Query } from '@opensearch-project/oui/src/eui_components/search_bar/search_bar';

export enum CorrelationsLevel {
  AllFindings = 'AllFindings',
  Finding = 'Finding',
}

export interface CorrelationGraphData {
  level: CorrelationsLevel;
  graph: {
    nodes: (Node & { chosen?: boolean })[];
    edges: any[];
  };
  events: any;
}

export type CorrelationGraphUpdateHandler = (newGraphData: CorrelationGraphData) => void;
export type CorrelationGraphEventHandler = (eventParams: any) => void;
export type CorrelationFinding = {
  id: string;
  correlationScore: number;
  logType: string;
  // rule: { name: string; severity: 'Critical' | 'Medium' | 'Info' | 'Low' };
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

export type CorrelationRuleTableItem = CorrelationRule & { logTypes: string };

export interface ICorrelationsStore {
  findings: { [id: string]: CorrelationFinding };
  correlations: { [finding: string]: string[] };
  colorByLogType: { [logType: string]: string };
  // getCorrelationsGraphData(levelInfo?: CorrelationLevelInfo): CorrelationGraphData;
  // registerGraphUpdateHandler(handler: CorrelationGraphUpdateHandler): void;
  registerGraphEventHandler(event: string, handler: CorrelationGraphEventHandler): void;
  resetCorrelationsLevel(): void;
  createCorrelationRule(correlationRule: CorrelationRule): void;
  getCorrelationRules(): CorrelationRule[];
  deleteCorrelationRule(ruleId: string): void;
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
