/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MAX_DETECTOR_INPUTS = 1;
export const MIN_NUM_DATA_SOURCES = 1;

export const STATUS_OPTIONS = [
  { value: 'test_status1', text: 'Test status #1' },
  { value: 'test_status2', text: 'Test status #2' },
];

export const EMPTY_DEFAULT_PERIOD_SCHEDULE = {
  period: {
    interval: 1,
    unit: 'm',
  },
};

export const EMPTY_DEFAULT_DETECTOR_INPUT = {
  input: {
    description: '',
    indices: [],
    rules: [],
  },
};

export const EMPTY_DEFAULT_DETECTOR = {
  type: '',
  detector_type: '',
  name: '',
  enabled: true,
  createdBy: '',
  schedule: EMPTY_DEFAULT_PERIOD_SCHEDULE,
  inputs: [EMPTY_DEFAULT_DETECTOR_INPUT],
  alert_conditions: [],
};

export const DETECTOR_TYPES = {
  NETFLOW: { id: 'netflow', label: 'Netflow' },
  DNS: { id: 'dns', label: 'DNS logs' },
  APACHE_ACCESS: { id: 'apache_access', label: 'Apache access logs' },
  WINDOWS: { id: 'windows', label: 'Windows logs' },
  AD_LDAP: { id: 'ad_ldap', label: 'AD/LDAP' },
  SYSTEM: { id: 'system', label: 'System logs' },
  CLOUD_TRAIL: { id: 'cloud_trail', label: 'Cloud Trail logs' },
  S3_ACCESS: { id: 's3_access', label: 'S3 access logs' },
  CUSTOM: { id: 'custom', label: 'Custom' },
};
