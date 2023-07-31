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
