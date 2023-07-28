/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogTypeItem extends LogType {
  detectionRules: number;
}

export interface LogType extends LogTypeBase {
  id: string;
}

export interface LogTypeBase {
  name: string;
  description: string;
  source: string;
  tags: {
    correlation_id: number;
  } | null;
}

export interface SearchLogTypesResponse {
  hits: {
    hits: {
      _id: string;
      _source: LogTypeBase;
    }[];
  };
}

export interface CreateLogTypeRequestBody extends LogTypeBase {}

export interface CreateLogTypeResponse {
  _id: string;
  logType: LogTypeBase;
}

export interface UpdateLogTypeParams {
  logTypeId: string;
  body: LogTypeBase;
}

export interface UpdateLogTypeResponse {
  _id: string;
  logType: LogTypeBase;
}

export interface DeleteLogTypeParams {
  logTypeId: string;
}

export interface DeleteLogTypeResponse {}
