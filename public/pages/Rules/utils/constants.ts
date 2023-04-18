/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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

export const ruleSeverity: { name: string; value: string; priority: string }[] = [
  { name: 'Critical', value: 'critical', priority: '1' },
  { name: 'High', value: 'high', priority: '2' },
  { name: 'Medium', value: 'medium', priority: '3' },
  { name: 'Low', value: 'low', priority: '4' },
  { name: 'Informational', value: 'informational', priority: '5' },
];

export const ruleSource: string[] = ['Sigma', 'Custom'];

export const ruleStatus: string[] = ['experimental', 'test', 'stable'];
