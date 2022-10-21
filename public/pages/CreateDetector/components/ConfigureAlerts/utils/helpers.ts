/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { SEVERITY_OPTIONS } from './constants';

export const parseSeverityToOption = (severity: string): EuiComboBoxOptionOption<string> => {
  return Object.values(SEVERITY_OPTIONS).find(
    (option) => option.label === severity
  ) as EuiComboBoxOptionOption<string>;
};

export const parseSeverityListToOptions = (
  severityList: string[]
): EuiComboBoxOptionOption<string>[] => {
  return severityList.map((severity) => parseSeverityToOption(severity));
};
