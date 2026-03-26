/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { KVDBDocument, KVDBResource } from '../../../../types/KVDBs';
import { ContentEntry } from '../components/KVDBContentEditor';

export interface KVDBFormModel {
  title: string;
  author: string;
  description: string;
  documentation: string;
  references: string[];
  supports: string[];
  enabled: boolean;
  contentEntries: ContentEntry[];
}

export const kvdbFormDefaultValue: KVDBFormModel = {
  title: '',
  author: '',
  description: '',
  documentation: '',
  references: [],
  supports: [],
  enabled: true,
  contentEntries: [],
};

/**
 * Convert from API document to form model (for edit mode)
 */
export const mapKVDBToForm = (document: KVDBDocument): KVDBFormModel => {
  const metadata = document.metadata;
  const refs = metadata?.references;
  const references = Array.isArray(refs) ? refs : refs ? [refs] : [];

  const contentEntries: ContentEntry[] = [];
  if (document.content && typeof document.content === 'object') {
    for (const [key, value] of Object.entries(document.content)) {
      contentEntries.push({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      });
    }
  }

  const supportsRaw = metadata?.supports;
  const supports = Array.isArray(supportsRaw) ? supportsRaw : supportsRaw ? [supportsRaw] : [];

  return {
    title: metadata?.title || '',
    author: metadata?.author || '',
    description: metadata?.description || '',
    documentation: metadata?.documentation || '',
    references,
    supports,
    enabled: document.enabled ?? true,
    contentEntries,
  };
};

/**
 * Convert content entries back to an object for the API payload.
 */
const entriesToContentObject = (entries: ContentEntry[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const entry of entries) {
    const key = entry.key.trim();
    if (!key) continue;

    const trimmed = entry.value.trim();
    if (trimmed[0] === '{' || trimmed[0] === '[') {
      try {
        result[key] = JSON.parse(trimmed);
        continue;
      } catch {
        // invalid JSON, store as string
      }
    }
    result[key] = entry.value;
  }
  return result;
};

/**
 * Convert from form model to API resource payload.
 * Note: date and modified are set by the indexer; do not send them.
 */
export const mapFormToKVDBResource = (values: KVDBFormModel): KVDBResource => {
  return {
    metadata: {
      title: values.title,
      author: values.author,
      description: values.description,
      documentation: values.documentation,
      references: values.references,
      supports: values.supports,
    },
    enabled: values.enabled,
    content: entriesToContentObject(values.contentEntries),
  };
};
