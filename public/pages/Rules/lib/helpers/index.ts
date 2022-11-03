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

export const ruleStatus: string[] = ['Select a rule status', 'experimental', 'test', 'stable'];

export const parseType = (logType: string) => {
  let type;
  switch (logType) {
    case 'antivirus' || 'django' || 'python' || 'rpc_firewall' || 'ruby' || 'spring' || 'sql':
      type = 'application';
    case 'aws' || 'azure' || 'gcp' || 'gworkspace' || 'm365' || 'okta' || 'onelogin':
      type = 'cloud';
    case 'auditd' ||
      'builtin' ||
      'file_create' ||
      'modsecurity' ||
      'network_connection' ||
      'process_creation':
  }
  return type;
};
