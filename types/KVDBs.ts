/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export interface KVDBDocument {
  id: string;
  title?: string;
  name?: string;
  author?: string;
  enabled?: boolean;
  description?: string;
  documentation?: string;
  references?: string[] | string;
  date?: string;
  content?: Record<string, unknown>;
  metadata?: {
    author?: {
      url?: string;
      name?: string;
      email?: string;
      date?: string;
    };
  };
}

export interface KVDBResource {
  title: string;
  author: string;
  description?: string;
  documentation?: string;
  references?: string[];
  enabled?: boolean;
  content?: Record<string, unknown>;
}

export interface KVDBSource {
  document: KVDBDocument;
  space?: string | { name?: string };
}

export interface KVDBIntegrationSource {
  document?: {
    id?: string;
    title?: string;
    kvdbs?: string[] | string;
  };
}

export interface KVDBIntegrationSummary {
  id?: string;
  title?: string;
}

export interface KVDBItem extends KVDBSource {
  id: string;
  integration?: KVDBIntegrationSummary;
}

export interface KVDBSearchRequest {
  from?: number;
  size?: number;
  sort?: Array<Record<string, { order: 'asc' | 'desc' }>>;
  query?: Record<string, unknown>;
  _source?: Record<string, unknown> | string[] | boolean;
  track_total_hits?: boolean;
}

export interface CreateKVDBPayload {
  resource: KVDBResource;
  integrationId: string;
}

export interface UpdateKVDBPayload {
  resource: KVDBResource;
}

export interface KVDBSearchResponse {
  hits: {
    total?: { value: number } | number;
    hits: {
      _id: string;
      _source: KVDBSource;
    }[];
  };
}

export interface KVDBIntegrationsSearchResponse {
  hits: {
    hits: {
      _id: string;
      _source: KVDBIntegrationSource;
    }[];
  };
}

export interface CUDKVDBResponse {
  message: string;
  status: number;
  error: string | null;
}
