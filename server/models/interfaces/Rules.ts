/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../../../models/interfaces';

export interface CreateRuleParams {
  body: string;
  category: string;
}

export interface CreateRulesResponse {
  _id: string;
  _version: number;
  rules: {
    rules: Rule & {
      last_update_time: number;
      monitor_id: string;
      rule_topic_index: string;
    };
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
