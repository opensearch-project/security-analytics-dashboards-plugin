/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export interface FilterDocument {
  id: string;
  name: string;
  type: string;
  check: string;
  enabled: boolean;
  metadata?: {
    description?: string;
    author?: {
      name?: string;
      email?: string;
      date?: string;
      modified?: string;
      url?: string;
    };
  };
}

export interface FilterSource {
  document: FilterDocument;
  space: { name: string };
  hash?: { sha256: string };
}

export interface FilterItem extends FilterSource {
  id: string;
}

export interface FilterSearchRequest {
  from?: number;
  size?: number;
  sort?: Array<Record<string, { order: 'asc' | 'desc' }>>;
  query?: Record<string, unknown>;
  track_total_hits?: boolean;
}

export interface FilterSearchResponse {
  hits: {
    total?: { value: number } | number;
    hits: { _id: string; _source: FilterSource }[];
  };
}

export interface FilterResource {
  name: string;
  enabled: boolean;
  check: string;
  type: string;
  metadata?: {
    description?: string;
    author?: { name?: string; email?: string; url?: string };
  };
}

export interface CreateFilterPayload {
  space: string;
  resource: FilterResource;
}

export interface UpdateFilterPayload {
  space: string;
  resource: FilterResource;
}

export interface CUDFilterResponse {
  message: string;
  status: number;
}
