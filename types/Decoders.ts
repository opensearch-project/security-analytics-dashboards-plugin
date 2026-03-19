/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { CatalogResourceMetadata } from './ResourceMetadata';

/**
 * Decoder-specific metadata that extends the common resource metadata.
 * Includes additional fields: module, compatibility, versions.
 */
export interface DecoderMetadata extends CatalogResourceMetadata {
  module?: string;
  compatibility?: string;
  versions?: string;
}

export interface DecoderDocument {
  id: string;
  name: string;
  enabled?: boolean;
  metadata: DecoderMetadata;
  definitions?: Record<string, unknown>;
  check?: Record<string, unknown>;
  parents?: string[];
  normalize?: Record<string, unknown>;
}

export interface DecoderSource {
  document: DecoderDocument;
  decoder?: string;
  space?: string;
}

export interface DecoderItem extends DecoderSource {
  id: string;
  integrations?: string[];
}

export interface SearchDecodersResponse {
  total: number;
  items: DecoderItem[];
}

export interface GetDecoderResponse {
  item?: DecoderItem;
}

export interface CUDDecoderResponse {
  message: string;
  status: number;
  error: string | null;
}
