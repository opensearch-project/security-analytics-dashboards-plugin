/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MAX_ALERT_CONDITIONS = 10;
export const MIN_ALERT_CONDITIONS = 0;

// SEVERITY_OPTIONS have the id, value, label, and text fields because some EUI components
// (e.g, EuiComboBox) require value/label pairings, while others
// (e.g., EuiCheckboxGroup) require id/text pairings.
export const RULE_SEVERITY_OPTIONS = {
  CRITICAL: { id: '1', value: 'critical', label: 'Critical', text: 'critical' },
  HIGH: { id: '2', value: 'high', label: 'High', text: 'High' },
  MEDIUM: { id: '3', value: 'medium', label: 'Medium', text: 'Medium' },
  LOW: { id: '4', value: 'low', label: 'Low', text: 'Low' },
  INFORMATIONAL: { id: '5', value: 'informational', label: 'Info', text: 'Info' },
};

export const MIN_NUM_NOTIFICATION_CHANNELS = 1;
export const MAX_NUM_NOTIFICATION_CHANNELS = 5;

export const MIN_NUM_RULES = 1;
export const MAX_NUM_RULES = 5;

// Only allows letters. No spaces, numbers, or special characters.
export const MIN_NUM_TAGS = 0;
export const MAX_NUM_TAGS = 5;

export let CHANNEL_TYPES = [
  'slack',
  'email',
  'email_group',
  'chime',
  'webhook',
  'ses_account',
  'sns',
  'microsoft_teams',
  'smtp_account',
];
