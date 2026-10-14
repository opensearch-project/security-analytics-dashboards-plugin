/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALERTS_SORT_FIELDS } from '../common/constants';

export interface AlertCondition {
  // Trigger fields
  name: string;
  id?: string;

  // Detector types
  types: string[];

  // Trigger fields based on Rules
  sev_levels: string[];
  tags: string[];
  ids: string[];

  // Alert related fields
  actions: TriggerAction[];
  severity: string;

  detection_types: string[];
}

export interface TriggerAction {
  id: string;
  // Id of notification channel
  destination_id: string;
  subject_template: {
    source: string;
    lang: string;
  };
  name: string;
  throttle_enabled: boolean;
  message_template: {
    source: string;
    lang: string;
  };
  throttle: {
    unit: string;
    value: number;
  };
}

export interface TriggerContext {
  ctx: {
    trigger: {
      name: string;
      severity: string;
    };
    detector: {
      name: string;
      description: string;
      datasources: string;
    };
  };
}

/**
 * API interfaces
 */

/**
 * Fields the get alerts API can sort by.
 */
export type AlertsSortField = typeof ALERTS_SORT_FIELDS[number];

/**
 * Without detector_id and detectorType the API returns the alerts of all detectors the user can
 * access (older backends reject such requests).
 */
export interface GetAlertsParams {
  detector_id?: string;
  detectorType?: string;
  sortOrder?: string;
  sortString?: AlertsSortField;
  size?: number;
  startIndex?: number;
  startTime?: number;
  endTime?: number;
  // Comma separated severity levels, e.g. "1,2"
  severityLevels?: string;
  // Comma separated alert states, e.g. "ACTIVE,ACKNOWLEDGED"
  alertStates?: string;
  // query_string query over the detector (monitor) and trigger names
  searchString?: string;
  // Cursor paging: the exact total and the cursors of the next and previous pages are returned.
  paging?: 'cursor';
  // In cursor paging, the cursor of the alert the page is after (next) or before (prev). Can't be
  // combined with startIndex.
  searchAfter?: string;
  direction?: 'next' | 'prev';
  dataSource?: any;
}

export interface GetAlertsResponse {
  alerts: AlertResponse[];
  total_alerts: number;
  detectorType: string;
  // Cursor paging only: the cursors of the next and previous pages, null if there is none
  next_cursor?: string | null;
  prev_cursor?: string | null;
}

export interface GetCorrelationAlertsResponse {
  correlationAlerts: CorrelationAlertResponse[];
  total_alerts: number;
}

export interface AckCorrelationAlertsResponse {
  acknowledged: CorrelationAlertResponse[];
  failed: CorrelationAlertResponse[];
}

export interface AlertItem {
  id: string;
  start_time: string;
  trigger_name: string;
  detector_id: string;
  state: string;
  severity: string;
  finding_ids: string[];
  last_notification_time: string;
  acknowledged_time: string | null;
}

export interface CorrelationAlertItem {
  id: string;
  start_time: string;
  trigger_name: string;
  correlation_rule_id: string;
  correlation_rule_name: string;
  state: string;
  severity: string;
  correlated_finding_ids: string[];
  end_time: string;
  acknowledged_time: string | null;
}

export interface CorrelationAlertTableItem extends CorrelationAlertItem {
  correlation_rule_categories: string[];
}

export interface AlertResponse extends AlertItem {
  version: number;
  schema_version: number;
  trigger_id: string;
  related_doc_ids: string[];
  error_message: string | null;
  alert_history: string[];
  action_execution_results: {
    action_id: string;
    last_execution_time: number;
    throttled_count: number;
  }[];
  end_time: string | null;
}

export interface CorrelationAlertResponse extends CorrelationAlertItem {
  version: number;
  schema_version: number;
  trigger_id: string;
  related_doc_ids: string[];
  error_message: string | null;
  alert_history: string[];
  action_execution_results: {
    action_id: string;
    last_execution_time: number;
    throttled_count: number;
  }[];
}

export interface AcknowledgeAlertsParams {
  body: { alerts: string[] };
  detector_id: string;
}

export interface AcknowledgeAlertsResponse {}
