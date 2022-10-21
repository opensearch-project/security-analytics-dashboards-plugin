/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { ALERT_SEVERITY_OPTIONS } from './constants';

export const parseAlertSeverityToOption = (severity: string): EuiComboBoxOptionOption<string> => {
  return Object.values(ALERT_SEVERITY_OPTIONS).find(
    (option) => option.label === severity
  ) as EuiComboBoxOptionOption<string>;
};

export const parseAlertSeverityListToOptions = (
  severityList: string[]
): EuiComboBoxOptionOption<string>[] => {
  return severityList.map((severity) => parseAlertSeverityToOption(severity));
};

export function createSelectedOptions(optionNames: string[]): EuiComboBoxOptionOption<string>[] {
  return optionNames.map((optionName) => ({ label: optionName }));
}
