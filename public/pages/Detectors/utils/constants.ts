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

export const DETECTOR_TYPES = {
  APPLICATION: { id: 'application', label: 'Application logs' },
  APT: { id: 'apt', label: 'APT logs' },
  CLOUD: { id: 'cloud', label: 'Cloud logs' },
  COMPLIANCE: { id: 'compliance', label: 'Compliance logs' },
  LINUX: { id: 'linux', label: 'Linux logs' },
  MACOS: { id: 'macos', label: 'MacOS logs' },
  NETWORK: { id: 'network', label: 'Network logs' },
  PROXY: { id: 'proxy', label: 'Proxy logs' },
  WEB: { id: 'web', label: 'Web logs' },
  WINDOWS: { id: 'windows', label: 'Windows logs' },
};
