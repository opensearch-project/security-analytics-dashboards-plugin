/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const ruleTypes: string[] = [
  'network',
  'dns',
  'apache_access',
  'windows',
  'ad_ldap',
  'linux',
  'cloudtrail',
  's3',
];

export const ruleSeverity: { name: string; value: string }[] = [
  { name: 'Critical', value: 'critical' },
  { name: 'High', value: 'high' },
  { name: 'Medium', value: 'medium' },
  { name: 'Low', value: 'low' },
  { name: 'Informational', value: 'informational' },
];

export const ruleSource: string[] = ['Sigma', 'Custom'];

export const ruleStatus: string[] = ['experimental', 'test', 'stable'];
