/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RuleItem {
  ruleName: string;
  ruleType: string;
  description: string;
  active: boolean;
}

export type RulesInfoByType = {
  [ruleType: string]: { ruleItems: RuleItem[]; activeCount: number };
};
