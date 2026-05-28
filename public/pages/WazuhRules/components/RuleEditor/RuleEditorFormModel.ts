/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ruleStatus } from '../../../Rules/utils/constants';
import { MitreState, EMPTY_MITRE } from '../../utils/mitre';

export interface RuleEditorFormModel {
  id: string;
  log_source: { product?: string; category?: string; service?: string };
  integration: string;
  status: string;
  tags: string[];
  detection: string;
  level: string;
  falsePositives: string[];
  mitre: MitreState;
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
  id: '',
  log_source: {},
  integration: '',
  status: ruleStatus[0],
  tags: [],
  detection: '',
  level: '',
  falsePositives: [],
  mitre: EMPTY_MITRE,
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
