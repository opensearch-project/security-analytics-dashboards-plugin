/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../../../models/interfaces';

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

export interface RuleInfo {
  _id: string;
  _index: string;
  _primary_term: number;
  _source: RuleSource;
  _version: number;
}

export type RuleSource = Rule & {
  last_update_time: string;
  queries: { value: string }[];
};
