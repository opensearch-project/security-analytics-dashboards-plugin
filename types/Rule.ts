/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleService } from '../public/services';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface Rule {
  id: string;
  category: string;
  log_source: {
    product?: string;
    category?: string;
    service?: string;
  };
  title: string;
  description: string;
  tags: Array<{ value: string }>;
  false_positives: Array<{ value: string }>;
  level: string;
  status: string;
  references: Array<{ value: string }>;
  author: string;
  detection: string;
}

export type RuleSource = Rule & {
  rule: string;
  last_update_time: string;
  queries: { value: string }[];
  query_field_names: { value: string }[];
};

export interface RuleInfo {
  _id: string;
  _index: string;
  _primary_term: number;
  _source: RuleSource;
  _version: number;
}

export interface DetectorRuleInfo {
  id: string;
}

export type RuleItemInfoBase = RuleInfo & { prePackaged: boolean; space?: string }; // Wazuh: added space field

/**
 * API Interfaces
 */
export interface CreateRuleParams {
  body: string;
  category: string;
}

export interface CreateRuleResponse {
  _id: string;
  _version: number;
  rule: Omit<Rule, 'id'> & {
    last_update_time: number;
    monitor_id: string;
  };
}

export interface UpdateRuleParams {
  body: string;
  category: string;
  ruleId: string;
}

export interface UpdateRuleResponse {
  _id: string;
  _version: number;
  rule: Omit<Rule, 'id'> & {
    last_update_time: number;
    monitor_id: string;
  };
}

export interface GetRulesParams {
  prePackaged: boolean;
  body: any;
}

export interface GetRulesResponse {
  hits: {
    hits: RuleInfo[];
    total: {
      value: number;
      relation: string;
    };
    timed_out: boolean;
  };
}

export interface DeleteRuleParams {
  ruleId: string;
}

export interface DeleteRuleResponse {}

export interface IRulesCache {
  [key: string]: RuleItemInfoBase[];
}

export interface IRulesStore {
  readonly service: RuleService;

  readonly notifications: NotificationsStart;

  getAllRules: (terms?: { [key: string]: string[] }, query?: any) => Promise<RuleItemInfoBase[]>;

  createRule: (rule: Rule, integrationId: string) => Promise<boolean>; // Wazuh: added integrationId param

  updateRule: (id: string, rule: Rule) => Promise<boolean>; // Wazuh: added integrationId param

  deleteRule: (id: string) => Promise<boolean>;

  getRules: (
    prePackaged: boolean,
    terms?: { [key: string]: string[] },
    query?: any
  ) => Promise<RuleItemInfoBase[]>;

  getPrePackagedRules: (terms?: { [key: string]: string[] }) => Promise<RuleItemInfoBase[]>;

  getCustomRules: (terms?: { [key: string]: string[] }) => Promise<RuleItemInfoBase[]>;

  // Wazuh: search rules with pagination and sorting
  searchRules: (
    params: { query?: any; from?: number; size?: number; sort?: Array<Record<string, any>> },
    space: string
  ) => Promise<{ total: number; items: RuleItemInfoBase[] }>;
}

export type RulesTableColumnFields = 'title' | 'level' | 'category' | 'source' | 'description';
