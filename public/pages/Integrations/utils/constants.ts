/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IntegrationBase } from '../../../../types';

export const OVERVIEW_TAB = {
  INTEGRATIONS: 'integrations',
  FILTERS: 'filters',
} as const;

export type OverviewTabId = typeof OVERVIEW_TAB[keyof typeof OVERVIEW_TAB];

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
    enabled: true,
    category: '',
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
