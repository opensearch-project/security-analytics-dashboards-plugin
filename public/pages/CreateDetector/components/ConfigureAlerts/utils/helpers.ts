/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { ALERT_SEVERITY_OPTIONS } from './constants';

export const parseAlertSeverityToOption = (severity: string): EuiComboBoxOptionOption<string> => {
  return Object.values(ALERT_SEVERITY_OPTIONS).find(
    (option) => option.value === severity
  ) as EuiComboBoxOptionOption<string>;
};

export function createSelectedOptions(optionNames: string[]): EuiComboBoxOptionOption<string>[] {
  return optionNames.map((optionName) => ({ label: optionName }));
}
