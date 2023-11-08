/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TriggerAction } from '../../../../../../../types';
import triggerActionMock from './TriggerAction.mock';
import { times } from 'lodash';
import { AlertCondition } from '../../../../../../../models/interfaces';

const triggerAction: TriggerAction = triggerActionMock;

export default {
  name: 'alert_name',
  id: 'trigger_id',
  types: ['detector_type_1'],
  sev_levels: ['severity_level_low'],
  tags: ['any.tag'],
  ids: ['rule_id_1'],
  actions: times(2, (index) => {
    return {
      ...triggerAction,
      id: `${triggerAction.id}_${index}`,
    };
  }),
  severity: '1',
} as AlertCondition;
