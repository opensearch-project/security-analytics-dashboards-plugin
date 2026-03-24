/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IntegrationBase } from '../../../../types';

export const OVERVIEW_TAB = {
  INTEGRATIONS: 'integrations',
  FILTERS: 'filters',
} as const;

export type OverviewTabId = (typeof OVERVIEW_TAB)[keyof typeof OVERVIEW_TAB];

export const integrationDetailsTabs = [
  {
    id: 'details',
    name: 'Details',
  },
  {
    id: 'detection_rules',
    name: 'Rules',
  },
  {
    id: 'decoders',
    name: 'Decoders',
  },
  {
    id: 'kvdbs',
    name: 'KVDBs',
  },
];

export const defaultIntegration: IntegrationBase = {
  document: {
    id: '',
    category: '',
    enabled: true,
    metadata: {
      title: '',
      author: '',
      date: '',
      modified: '',
      description: '',
      references: [],
      documentation: '',
      supports: [],
    },
    tags: null,
  },
  space: {
    name: '',
  },
};

export const integrationLabels: { [value: string]: string } = {
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
