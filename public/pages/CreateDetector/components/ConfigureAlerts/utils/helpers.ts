/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEVERITY_OPTIONS } from './constants';

export const parseSeverityToOption = (severity: string) => {
  return Object.values(SEVERITY_OPTIONS).find((option) => option.value === severity);
};

export const parseSeverityListToOptions = (severityList: string[]) => {
  return severityList.map((severity) => parseSeverityToOption(severity));
};
