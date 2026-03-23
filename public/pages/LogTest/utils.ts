/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { METADATA_FIELDS } from './constants';

export interface MetadataEntry {
  key: string;
  value: string;
}

/** Converts a flat array of {key, value} dotted path entries into a nested object.
 *  Number-typed fields are cast to number. Empty keys/values are skipped.
 *  e.g. [{ key: 'agent.id', value: '1' }] => { agent: { id: 1 } }
 */
export function buildMetadataObject(
  entries: MetadataEntry[]
): Record<string, string | number | object> {
  const result: Record<string, any> = {};

  for (const { key, value } of entries) {
    if (!key || value === '') continue;

    const parts = key.split('.');
    let cursor = result;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!cursor[parts[i]] || typeof cursor[parts[i]] !== 'object') {
        cursor[parts[i]] = {};
      }
      cursor = cursor[parts[i]];
    }

    const leaf = parts[parts.length - 1];
    const fieldDef = METADATA_FIELDS.find((f) => f.key === key);
    cursor[leaf] = fieldDef?.type === 'number' ? Number(value) : value;
  }

  return result;
}
