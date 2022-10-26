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

export const ruleSeverity: string[] = ['low', 'medium', 'informational', 'high', 'critical'];

export const ruleSource: string[] = ['default', 'custom'];

export const ruleStatus: string[] = ['Select a rule status', 'Experimental', 'Test', 'Stable'];

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
