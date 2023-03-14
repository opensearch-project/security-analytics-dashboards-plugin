/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleService } from '../public/services';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface Rule {
  id: string;
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

export type RuleSource = Rule & {
  rule: string;
  last_update_time: string;
  queries: { value: string }[];
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

export type RuleItemInfoBase = RuleInfo & { prePackaged: boolean };

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

  createRule: (rule: Rule) => Promise<boolean>;

  updateRule: (id: string, category: string, rule: Rule) => Promise<boolean>;

  deleteRule: (id: string) => Promise<boolean>;

  getRules: (
    prePackaged: boolean,
    terms?: { [key: string]: string[] },
    query?: any
  ) => Promise<RuleItemInfoBase[]>;

  getPrePackagedRules: (terms?: { [key: string]: string[] }) => Promise<RuleItemInfoBase[]>;

  getCustomRules: (terms?: { [key: string]: string[] }) => Promise<RuleItemInfoBase[]>;
}
