/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';

export interface RuleEditorFormState {
  id: string;
  log_source: string;
  logType: string;
  name: string;
  description: string;
  status: string;
  author: string;
  references: string[];
  tags: EuiComboBoxOptionOption<string>[];
  detection: string;
  level: string;
  falsePositives: string[];
}
