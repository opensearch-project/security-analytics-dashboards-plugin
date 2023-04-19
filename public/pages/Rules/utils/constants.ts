/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { euiPaletteForStatus } from '@elastic/eui';

export const ruleTypes: { label: string; value: string; abbr: string }[] = [
  { abbr: 'NTW', label: 'Network', value: 'network' },
  { abbr: 'DNS', label: 'DNS', value: 'dns' },
  { abbr: 'APC', label: 'Apache Access', value: 'apache_access' },
  { abbr: 'WIN', label: 'Windows', value: 'windows' },
  { abbr: 'AD', label: 'AD/LDAP', value: 'ad_ldap' },
  { abbr: 'LNX', label: 'Linux', value: 'linux' },
  { abbr: 'CLT', label: 'Cloudtrail', value: 'cloudtrail' },
  { abbr: 'S3', label: 'S3', value: 's3' },
  { abbr: 'GGL', label: 'Google Workspace', value: 'gworkspace' },
  { abbr: 'GHB', label: 'Github actions', value: 'github' },
  { abbr: 'MSO', label: 'Microsoft 365', value: 'm365' },
  { abbr: 'OKT', label: 'Okta', value: 'okta' },
  { abbr: 'AZR', label: 'Azure', value: 'azure' },
];

const paletteColors = euiPaletteForStatus(5);

export const ruleSeverity: { name: string; value: string; priority: string; color: string }[] = [
  { name: 'Critical', value: 'critical', priority: '1', color: paletteColors[4] },
  { name: 'High', value: 'high', priority: '2', color: paletteColors[3] },
  { name: 'Medium', value: 'medium', priority: '3', color: paletteColors[2] },
  { name: 'Low', value: 'low', priority: '4', color: paletteColors[1] },
  { name: 'Informational', value: 'informational', priority: '5', color: paletteColors[0] },
];

export const ruleSource: string[] = ['Sigma', 'Custom'];

export const ruleStatus: string[] = ['experimental', 'test', 'stable'];
