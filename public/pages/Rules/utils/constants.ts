/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const ruleTypes: { label: string; value: string }[] = [
  { label: 'Network', value: 'network' },
  { label: 'DNS', value: 'dns' },
  { label: 'Apache Access', value: 'apache_access' },
  { label: 'Windows', value: 'windows' },
  { label: 'AD/LDAP', value: 'ad_ldap' },
  { label: 'Linux', value: 'linux' },
  { label: 'Cloudtrail', value: 'cloudtrail' },
  { label: 'S3', value: 's3' },
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
