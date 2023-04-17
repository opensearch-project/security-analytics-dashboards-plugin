/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationRuleModel } from '../../../../types';

export const correlationRuleStateDefaultValue: CorrelationRuleModel = {
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
