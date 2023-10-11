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
  cloudtrail: 'Cloudtrail',
  dns: 'DNS',
  vpcflow: 'VPC Flow',
  ad_ldap: 'Ad/ldap',
  apache_access: 'Apache Access',
  m365: 'M365',
  okta: 'Okta',
  waf: 'WAF',
  s3: 'S3',
  github: 'Github',
  gworkspace: 'GWorkspace',
  windows: 'Windows',
  network: 'Network',
  linux: 'Linux',
  azure: 'Azure',
};
