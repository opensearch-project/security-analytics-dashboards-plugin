/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALERT_STATE } from '../../../utils/constants';

export enum AlertSeverity {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
}

export const severityOptions = [
  { value: 'ALL', text: 'All severity levels' },
  { value: AlertSeverity.ONE, text: '1 (Highest)' },
  { value: AlertSeverity.TWO, text: '2 (High)' },
  { value: AlertSeverity.THREE, text: '3 (Medium)' },
  { value: AlertSeverity.FOUR, text: '4 (Low)' },
  { value: AlertSeverity.FIVE, text: '5 (Lowest)' },
];

export const stateOptions = [
  { value: 'ALL', text: 'All alerts' },
  { value: ALERT_STATE.ACTIVE, text: 'Active' },
  { value: ALERT_STATE.ACKNOWLEDGED, text: 'Acknowledged' },
  { value: ALERT_STATE.COMPLETED, text: 'Completed' },
  { value: ALERT_STATE.ERROR, text: 'Error' },
  { value: ALERT_STATE.DELETED, text: 'Deleted' },
];
