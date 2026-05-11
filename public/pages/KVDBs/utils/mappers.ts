/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import YAML, { Pair, Scalar, YAMLMap } from 'yaml';
import { LosslessNumber, stringify as LosslessStringify } from 'lossless-json';
import { KVDBMetadata, KVDBResource } from '../../../../types/KVDBs';
import { ContentEntry } from '../components/KVDBContentEditor';
import { mapYamlToLosslessObject, stringToYamlNode } from '../../../components/YamlForm';

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

const normalizeStringArray = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

/** Extracts shared metadata fields from a KVDBMetadata object into form fields. */
const metadataToFormFields = (metadata: KVDBMetadata | undefined) => ({
  title: metadata?.title || '',
  author: metadata?.author || '',
  description: metadata?.description || '',
  documentation: metadata?.documentation || '',
  references: normalizeStringArray(metadata?.references),
  supports: normalizeStringArray(metadata?.supports),
});

/** Converts any content value to a display string for a form entry. */
const contentValueToString = (value: unknown): string => {
  if (value instanceof LosslessNumber) return value.toString();
  if (typeof value === 'string') return value;
  return LosslessStringify(value, null, 2);
};

/** Converts a content object into form entries. */
const contentToEntries = (content: Record<string, unknown> | undefined): ContentEntry[] => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return [];
  return Object.entries(content).map(([key, value]) => ({
    key,
    value: contentValueToString(value),
  }));
};

/** Form model to YAML string (to persist). */
export const mapFormToYaml = (values: KVDBFormModel): string => {
  const doc = YAML.parseDocument(
    YAML.stringify(
      {
        metadata: {
          title: values.title,
          author: values.author,
          description: values.description,
          documentation: values.documentation,
          references: values.references,
          supports: values.supports,
        },
        enabled: values.enabled,
      },
      { lineWidth: 0 }
    )
  );

  const contentMap = new YAMLMap();
  for (const { key, value } of values.contentEntries) {
    const trimmedKey = key.trim();
    if (!trimmedKey) continue;
    contentMap.add(new Pair(new Scalar(trimmedKey), stringToYamlNode(value)));
  }

  doc.set('content', contentMap);

  return doc.toString({ lineWidth: 0 });
};

/** YAML string to form model */
export const mapYamlToForm = (yamlStr: string): KVDBFormModel => {
  const parsed = mapYamlToLosslessObject<KVDBResource | null>(yamlStr);
  if (!parsed) return kvdbFormDefaultValue;
  return {
    ...metadataToFormFields(parsed.metadata),
    enabled: parsed.enabled ?? true,
    contentEntries: contentToEntries(parsed.content),
  };
};
