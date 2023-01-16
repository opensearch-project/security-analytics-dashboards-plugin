/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { modelsMock } from "../";
import { TriggerAction } from '../../../models/interfaces';

const { triggerActionMock } = modelsMock;
const triggerAction: TriggerAction = triggerActionMock;


export default {
  name: 'some name',
  id: 'some id',
  types: ['some types'],
  sev_levels: ['some severity levels'],
  tags: ['some tags'],
  ids: ['some ids'],
  actions: [triggerAction],
  severity: 'some severity',
}
