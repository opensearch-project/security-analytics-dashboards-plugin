/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export interface DecoderDocumentAuthor {
  name?: string;
  email?: string;
  url?: string;
  date?: string;
}

export interface DecoderDocumentMetadata {
  title?: string;
  module?: string;
  compatibility?: string;
  versions?: string;
  description?: string;
  author?: DecoderDocumentAuthor;
}

export interface DecoderDocument {
  id: string;
  name: string;
  metadata?: DecoderDocumentMetadata;
  space?: string;
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
