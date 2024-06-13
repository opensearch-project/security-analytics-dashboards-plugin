/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationRuleModel } from '../../../../types';

export const correlationRuleStateDefaultValue: CorrelationRuleModel = {
  name: '',
  time_window: 300000,
  queries: [
    {
      logType: '',
      conditions: [
        {
          name: '',
          value: '',
          condition: 'AND',
        },
      ],
      index: '',
      field: '',
    },
    {
      logType: '',
      conditions: [
        {
          name: '',
          value: '',
          condition: 'AND',
        },
      ],
      index: '',
      field: '',
    },
  ],
  trigger: {
    name: '',
    id: '',
    sev_levels: [],
    ids: [],
    actions: [],
    severity: ''
  }
};
