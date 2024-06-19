/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelIocType } from '../../../../common/constants';
import { ThreatIntelIocData, ThreatIntelLogSource, ThreatIntelSourceItem } from '../../../../types';

export enum ConfigureThreatIntelScanStep {
  SelectLogSources = 'SelectLogSources',
  SetupAlertTriggers = 'SetupAlertTriggers',
}

// TODO: Remove below Dummy data once APIs are integrated
export const dummyIoCDetails: ThreatIntelIocData = {
  id: 'indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f',
  name: 'my-bad-ip',
  type: ThreatIntelIocType.IPAddress,
  value: '192.0.2.1',
  severity: 'High',
  created: 1718761171,
  modified: 1718761171,
  description: 'Random IP address',
  labels: [],
  feedId: 'random-feed-id',
  specVersion: '',
  version: 1,
};

export const dummySource: ThreatIntelSourceItem = {
  id: 'hello-world',
  feedName: 'AlienVault',
  description: 'Short description for threat intel source',
  isEnabled: false,
  iocTypes: ['IP', 'Domain', 'File hash'],
};

export const dummyLogSource: ThreatIntelLogSource = {
  name: 'windows*',
  iocConfigMap: {
    [ThreatIntelIocType.IPAddress]: {
      enabled: true,
      fieldAliases: ['src_ip', 'dst.ip'],
    },
    [ThreatIntelIocType.Domain]: {
      enabled: true,
      fieldAliases: ['domain'],
    },
    [ThreatIntelIocType.FileHash]: {
      enabled: false,
      fieldAliases: ['hash'],
    },
  },
};

export const dummyLogSource2: ThreatIntelLogSource = {
  name: 'cloudtrail*',
  iocConfigMap: {
    [ThreatIntelIocType.IPAddress]: {
      enabled: true,
      fieldAliases: ['src_ip', 'dst.ip'],
    },
    [ThreatIntelIocType.Domain]: {
      enabled: true,
      fieldAliases: ['domain'],
    },
    [ThreatIntelIocType.FileHash]: {
      enabled: false,
      fieldAliases: ['hash'],
    },
  },
};
