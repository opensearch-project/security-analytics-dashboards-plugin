/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type GetAlertsParams =
  | {
      detectorId: string;
      detectorType?: string;
    }
  | {
      detectorType: string;
      detectorId?: string;
    };

export interface GetAlertsResponse {
  alerts: AlertResponse[];
}

export interface AlertResponse {
  detector_id: string;
  id: string;
  version: number;
  schema_version: number;
  trigger_id: string;
  trigger_name: string;
  finding_ids: string[];
  related_doc_ids: string[];
  state: string;
  error_message: string | null;
  alert_history: string[];
  severity: string;
  action_execution_results: string[];
  start_time: string;
  last_notification_time: string;
  end_time: string | null;
  acknowledged_time: string | null;
}
