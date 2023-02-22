/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertItem } from '../../../types';

export default {
  id: 'some id',
  start_time: 'some start time',
  trigger_name: 'some trigger name',
  detector_id: 'some detector id',
  state: 'some state',
  severity: 'critical',
  finding_ids: ['some finding id'],
  last_notification_time: 'some notification time',
  acknowledged_time: 'some acknowledged time',
} as AlertItem;
