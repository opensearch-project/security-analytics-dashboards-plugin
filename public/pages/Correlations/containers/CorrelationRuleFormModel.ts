/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationRule } from '../../../../types';

export const correlationRuleStateDefaultValue: CorrelationRule = {
  name: '',
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
    },
  ],
};
