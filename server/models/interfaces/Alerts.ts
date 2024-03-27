/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type GetAlertsParams = {
  sortOrder?: string;
  size?: number;
  startIndex?: number;
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

export interface AlertItem {
  id: string;
  start_time: string;
  trigger_name: string;
  detector_id: string;
  state: string;
  error_message: string | null;
  severity: string;
  finding_ids: string[];
  last_notification_time: string;
  acknowledged_time: string | null;
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

export interface AcknowledgeAlertsParams {
  body: { alerts: string[] };
  detector_id: string;
}

export interface AcknowledgeAlertsResponse {}
