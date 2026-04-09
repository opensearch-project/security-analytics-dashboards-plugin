/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type LogTestTraceLevel = 'NONE' | 'ASSET_ONLY' | 'ALL';

export interface LogTestRequestBody {
  queue: number;
  location: string;
  metadata?: Record<string, string | number | object>;
  event: string;
  trace_level?: LogTestTraceLevel;
  space: string;
}

export interface LogTestAssetTrace {
  asset: string;
  success: boolean;
  traces: string[];
}

export interface LogTestMatchedRule {
  id?: string;
  rule_id?: string;
  name?: string;
  title?: string;
  level?: string;
  severity?: string;
  [key: string]: unknown;
}

export interface LogTestValidationError {
  path: string;
  kind: 'unknown_field' | 'invalid_type' | 'temporary_field_not_allowed';
  expected?: string | null;
  actual?: string | null;
  [key: string]: unknown;
}

export interface LogTestValidation {
  valid: boolean;
  errors: LogTestValidationError[];
}

export interface LogTestResult {
  output: object;
  asset_traces?: LogTestAssetTrace[];
  matched_rules?: LogTestMatchedRule[];
  validation?: LogTestValidation;
}

export interface LogTestResponse {
  status: string;
  message: LogTestResult;
}

export interface LogTestApiRequest {
  document: LogTestRequestBody;
}
