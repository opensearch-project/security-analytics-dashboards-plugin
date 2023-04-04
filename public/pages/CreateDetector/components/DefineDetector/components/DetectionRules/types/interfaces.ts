/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleInfo } from '../../../../../../../../server/models/interfaces';
import { RuleItemInfoBase } from '../../../../../../../../types';

export interface RuleItem {
  name: string;
  id: string;
  severity: string;
  logType: string;
  library: string;
  description: string;
  active: boolean;
  ruleInfo: RuleInfo;
}

export type RuleItemInfo = RuleItemInfoBase & { enabled: boolean };

export type RulesInfoByType = {
  [ruleType: string]: RuleItemInfo[];
};
