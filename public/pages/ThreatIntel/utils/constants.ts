/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelIocType } from '../../../../common/constants';
import {
  ThreatIntelIocData,
  ThreatIntelLogSource,
  ThreatIntelScanConfig,
  ThreatIntelSourceItem,
} from '../../../../types';
import { getEmptyThreatIntelAlertTrigger } from './helpers';

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
  num_findings: 0,
};

export const dummySource: ThreatIntelSourceItem = {
  id: 'hello-world',
  name: 'AlienVault',
  description: 'Short description for threat intel source',
  enabled: false,
  ioc_types: [ThreatIntelIocType.IPAddress, ThreatIntelIocType.Domain],
  enabled_time: 1718924173068,
  format: 'STIX2',
  last_refreshed_time: 1718924173211,
  schedule: {
    interval: {
      start_time: 1718924173055,
      period: 1,
      unit: 'DAYS',
    },
  },
  source: {
    s3: {
      bucket_name: 'threat-intel-s3-test-bucket',
      object_key: 'bd',
      region: 'us-west-2',
      role_arn: 'arn:aws:iam::540654354201:role/threat_intel_s3_test_role',
    },
  },
  state: 'REFRESH_FAILED',
  store_type: 'OS',
  type: 'S3_CUSTOM',
  version: 438,
  created_by_user: null,
  created_at: 1718924173068,
  last_update_time: 1718993593158,
  refresh_type: 'FULL',
  last_refreshed_user: null,
};

export const dummyScanConfig: ThreatIntelScanConfig = {
  id: '',
  enabled: true,
  name: '',
  indices: ['windows'],
  per_ioc_type_scan_input_list: [
    {
      ioc_type: ThreatIntelIocType.IPAddress,
      index_to_fields_map: {
        windows: ['DestinationIp'],
      },
    },
  ],
  schedule: {
    period: {
      interval: 1,
      unit: 'DAYS',
    },
  },
  triggers: [getEmptyThreatIntelAlertTrigger('Sample trigger')],
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
