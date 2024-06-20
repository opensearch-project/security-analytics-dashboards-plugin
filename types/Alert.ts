/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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

/**
 * API interfaces
 */

export type GetAlertsParams = {
  sortOrder?: string;
  size?: number;
  startIndex?: number;
  startTime?: number;
  endTime?: number;
} & (
  | {
      detector_id: string;
      detectorType?: string;
    }
  | {
      detectorType: string;
      detector_id?: string;
    }
);

export interface GetAlertsResponse {
  alerts: AlertResponse[];
  total_alerts: number;
  detectorType: string;
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

export interface CorrelationAlertColumns extends CorrelationAlertItem{
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
