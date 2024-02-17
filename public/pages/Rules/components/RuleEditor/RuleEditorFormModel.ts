/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_RULE_UUID } from '../../../../../common/constants';
import { ruleStatus } from '../../utils/constants';

export interface RuleEditorFormModel {
  id: string;
  log_source: { product?: string; category?: string; service?: string };
  logType: string;
  name: string;
  description: string;
  status: string;
  author: string;
  references: string[];
  tags: string[];
  detection: string;
  level: string;
  falsePositives: string[];
}

export const ruleEditorStateDefaultValue: RuleEditorFormModel = {
  id: DEFAULT_RULE_UUID,
  log_source: {},
  logType: '',
  name: '',
  description: '',
  status: ruleStatus[0],
  author: '',
  references: [],
  tags: [],
  detection: '',
  level: '',
  falsePositives: [],
};
