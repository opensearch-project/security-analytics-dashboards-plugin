/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { euiPaletteForStatus } from '@elastic/eui';

export const ruleTypes: {
  label: string;
  value: string;
  id: string;
  category: string;
  isStandard: boolean;
}[] = [];

const paletteColors = euiPaletteForStatus(5);

export enum RuleSeverityValue {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Informational = 'informational',
}

export const RuleSeverityPriority: Record<RuleSeverityValue, string> = {
  [RuleSeverityValue.Critical]: '1',
  [RuleSeverityValue.High]: '2',
  [RuleSeverityValue.Medium]: '3',
  [RuleSeverityValue.Low]: '4',
  [RuleSeverityValue.Informational]: '5',
};

export const ruleSeverity: {
  name: string;
  value: string;
  priority: string;
  color: { background: string; text: string };
}[] = [
  {
    name: 'Critical',
    value: RuleSeverityValue.Critical,
    priority: RuleSeverityPriority[RuleSeverityValue.Critical],
    color: { background: paletteColors[4], text: 'white' },
  },
  {
    name: 'High',
    value: RuleSeverityValue.High,
    priority: RuleSeverityPriority[RuleSeverityValue.High],
    color: { background: paletteColors[3], text: 'white' },
  },
  {
    name: 'Medium',
    value: RuleSeverityValue.Medium,
    priority: RuleSeverityPriority[RuleSeverityValue.Medium],
    color: { background: paletteColors[2], text: 'black' },
  },
  {
    name: 'Low',
    value: RuleSeverityValue.Low,
    priority: RuleSeverityPriority[RuleSeverityValue.Low],
    color: { background: paletteColors[1], text: 'white' },
  },
  {
    name: 'Informational',
    value: RuleSeverityValue.Informational,
    priority: RuleSeverityPriority[RuleSeverityValue.Informational],
    color: { background: paletteColors[0], text: 'white' },
  },
];

export const ruleSource: string[] = ['Standard', 'Custom'];

export const ruleStatus: string[] = ['experimental', 'test', 'stable'];

export const sigmaRuleLogSourceFields = ['product', 'category', 'service'];
