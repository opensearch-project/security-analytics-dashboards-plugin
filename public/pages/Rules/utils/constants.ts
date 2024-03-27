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

export const ruleSeverity: {
  name: string;
  value: string;
  priority: string;
  color: { background: string; text: string };
}[] = [
  {
    name: 'Critical',
    value: 'critical',
    priority: '1',
    color: { background: paletteColors[4], text: 'white' },
  },
  {
    name: 'High',
    value: 'high',
    priority: '2',
    color: { background: paletteColors[3], text: 'white' },
  },
  {
    name: 'Medium',
    value: 'medium',
    priority: '3',
    color: { background: paletteColors[2], text: 'black' },
  },
  {
    name: 'Low',
    value: 'low',
    priority: '4',
    color: { background: paletteColors[1], text: 'white' },
  },
  {
    name: 'Informational',
    value: 'informational',
    priority: '5',
    color: { background: paletteColors[0], text: 'white' },
  },
];

export const ruleSource: string[] = ['Standard', 'Custom'];

export const ruleStatus: string[] = ['experimental', 'test', 'stable'];

export const sigmaRuleLogSourceFields = ['product', 'category', 'service'];

export const yamlMediaTypes = new Set(['application/x-yaml', 'text/yaml', 'text/x-yaml']);
