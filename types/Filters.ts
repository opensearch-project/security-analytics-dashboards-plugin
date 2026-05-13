/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type FilterCheckListItem = Record<string, unknown>;
export type FilterCheck = string | FilterCheckListItem[];

export interface FilterDocument {
  id: string;
  name: string;
  type: string;
  check: FilterCheck;
  enabled: boolean;
  metadata?: {
    title?: string;
    description?: string;
    author?: string | { name?: string };
    date?: string;
    modified?: string;
    references?: string[];
    documentation?: string;
    supports?: string[];
  };
}

export interface FilterSource {
  document: FilterDocument;
  yaml: string;
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
  check: FilterCheck;
  type: string;
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    modified?: string;
    description?: string;
    references?: string[];
    documentation?: string;
    supports?: string[];
  };
}

export interface CreateFilterPayload {
  space: string;
  resourceYaml: string;
}
export interface UpdateFilterPayload {
  space: string;
  resourceYaml: string;
}
export interface CUDFilterResponse {
  message: string;
  status: number;
}
