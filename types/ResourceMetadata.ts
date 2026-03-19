/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared metadata model for all catalog resources. Contains the common fields
 * that are nested under `document.metadata` in the indexed document.
 *
 * Aligns with indexer IRMAs (Integration, Decoder, Rule, KVDB, Filter).
 *
 * Resource-specific fields:
 * - `compatibility` — Policy only.
 * - `supports` — Integration, Decoder, Rule, KVDB, Filter.
 */
export interface ResourceMetadata {
  title: string;
  author: string;
  date?: string;
  modified?: string;
  description?: string;
  references?: string[];
  documentation?: string;
  compatibility?: string[];
  supports?: string[];
}

/**
 * Policy-specific metadata with compatibility field.
 */
export interface PolicyMetadata extends Omit<ResourceMetadata, 'supports'> {
  compatibility?: string[];
}

/**
 * Metadata for catalog resources (Integration, Decoder, Rule, KVDB, Filter).
 * Extends base metadata with supports field.
 */
export interface CatalogResourceMetadata extends Omit<ResourceMetadata, 'compatibility'> {
  supports?: string[];
}
