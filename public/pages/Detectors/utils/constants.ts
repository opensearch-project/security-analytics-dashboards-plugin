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
