/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DEFAULT_RULE_UUID } from '../../../../../common/constants';
import { Rule } from '../../../../../types';
import { ruleStatus } from '../../../Rules/utils/constants';

export interface RuleEditorFormModel {
  id: string;
  log_source: { product?: string; category?: string; service?: string };
  integration: string;
  status: string;
  tags: string[];
  detection: string;
  level: string;
  falsePositives: string[];
  mitre: string;
  compliance: string;
  enabled: boolean;
  metadata: {
    title: string;
    author: string;
    description: string;
    references: string[];
    supports: string[];
    documentation: string;
  };
}

export const ruleEditorStateDefaultValue: RuleEditorFormModel = {
  id: DEFAULT_RULE_UUID,
  log_source: {},
  integration: '',
  status: ruleStatus[0],
  tags: [],
  detection: '',
  level: '',
  falsePositives: [],
  mitre: '',
  compliance: '',
  enabled: true,
  metadata: {
    title: '',
    author: '',
    description: '',
    references: [],
    supports: [],
    documentation: '',
  },
};
