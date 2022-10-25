/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleInfo } from '../../../../../../../../server/models/interfaces';

export interface RuleItem {
  name: string;
  id: string;
  severity: string;
  logType: string;
  library: string;
  description: string;
  active: boolean;
}

export type RuleItemInfo = RuleInfo & { enabled: boolean; prePackaged: boolean };

export type RulesInfoByType = {
  [ruleType: string]: RuleItemInfo[];
};
