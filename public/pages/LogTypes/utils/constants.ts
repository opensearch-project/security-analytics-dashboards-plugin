/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogTypeBase } from '../../../../types';

export const logTypeDetailsTabs = [
  {
    id: 'details',
    name: 'Details',
  },
  {
    id: 'detection_rules',
    name: 'Detection rules',
  },
];

export const defaultLogType: LogTypeBase = {
  name: '',
  description: '',
  source: 'Custom',
  tags: null,
};

export const logTypeLabels = {
  cloudtrail: 'AWS Cloudtrail',
  dns: 'DNS',
  vpcflow: 'VPC Flow',
  ad_ldap: 'AD/LDAP',
  apache_access: 'Apache Access',
  m365: 'Microsoft 365',
  okta: 'Okta',
  waf: 'WAF',
  s3: 'AWS S3',
  github: 'Github',
  gworkspace: 'Google Workspace',
  windows: 'Microsoft Windows',
  network: 'Network',
  linux: 'Linux System Logs',
  azure: 'Microsoft Azure',
};
