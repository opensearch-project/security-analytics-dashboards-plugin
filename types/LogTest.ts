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
}

export interface LogTestAssetTrace {
  asset: string;
  success: boolean;
  traces: string[];
}

export interface LogTestResult {
  output: object;
  asset_traces?: LogTestAssetTrace[];
}

export interface LogTestResponse {
  status: string;
  message: LogTestResult;
}

export interface LogTestApiRequest {
  document: LogTestRequestBody;
  integrationId: string;
}
