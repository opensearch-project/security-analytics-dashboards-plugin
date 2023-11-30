/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationRuleModel } from '../../../../types';

export const correlationRuleStateDefaultValue: CorrelationRuleModel = {
  name: '',
  time_window: 60000,
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
};
