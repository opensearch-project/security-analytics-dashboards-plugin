/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import YAML, { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';
import { LosslessNumber, stringify as LosslessStringify } from 'lossless-json';
import { FilterDocument, FilterResource } from '../../../../types/Filters';
import { mapYamlToLosslessObject, stringToYamlNode, normalizeToStringArray } from '../../../components/YamlForm';

export interface FilterFormModel {
  name: string;
  type: string;
  check: string;
  enabled: boolean;
  author: string;
  description: string;
  documentation: string;
  references: string[];
  supports: string[];
}

export const filterFormDefaultValue: FilterFormModel = {
  name: '',
  type: 'pre-filter',
  check: '',
  enabled: true,
  author: '',
  description: '',
  documentation: '',
  references: [],
  supports: [],
};

export const filterYamlFormDefaultValue: string = `name: filter/<name>/<version>
type: pre-filter
check: ''
enabled: true
metadata:
  title: ''
  author: ''
  description: ''
  documentation: ''
  references: []
  supports: []`;


/**
 * Converts a yaml check expression value to a string.
 * Checklist arrays are serialized to block style YAML for display.
 */
const checkToFormString = (check: unknown): string => {
  if (typeof check === 'string') return check;
  if (check instanceof LosslessNumber) return check.toString();
  if (check !== null && check !== undefined) {
    const jsonStr = LosslessStringify(check);
    if (!jsonStr) return '';
    try {
      const doc = YAML.parseDocument(jsonStr);
      YAML.visit(doc, {
        Map(_, n) {
          (n as YAMLMap).flow = false;
        },
        Seq(_, n) {
          (n as YAMLSeq).flow = false;
        },
        Pair(_, n) {
          const key = (n as Pair<Scalar, unknown>).key;
          if (
            key instanceof Scalar &&
            (key.type === 'QUOTE_DOUBLE' || key.type === 'QUOTE_SINGLE')
          ) {
            key.type = null;
          }
        },
      });
      return doc.toString({ lineWidth: 0 }).trim();
    } catch {
      return jsonStr;
    }
  }
  return '';
};

export const mapYamlToFilterForm = (yamlObj: any): FilterFormModel => {
  const author = yamlObj?.metadata?.author;
  return {
    name: yamlObj?.name ?? '',
    type: yamlObj?.type ?? 'pre-filter',
    check: checkToFormString(yamlObj?.check),
    enabled: yamlObj?.enabled ?? true,
    author: typeof author === 'string' ? author : author?.name ?? '',
    description: yamlObj?.metadata?.description ?? '',
    documentation: yamlObj?.metadata?.documentation ?? '',
    references: normalizeToStringArray(yamlObj?.metadata?.references),
    supports: normalizeToStringArray(yamlObj?.metadata?.supports),
  };
};

export const mapFilterToForm = (document: FilterDocument): FilterFormModel => {
  const author = document.metadata?.author;
  return {
    name: document.name ?? '',
    type: document.type ?? '',
    check: checkToFormString(document.check),
    enabled: document.enabled ?? true,
    author: typeof author === 'string' ? author : author?.name ?? '',
    description: document.metadata?.description ?? '',
    documentation: document.metadata?.documentation ?? '',
    references: document.metadata?.references ?? [],
    supports: document.metadata?.supports ?? [],
  };
};

export const mapFormToFilterResource = (values: FilterFormModel): FilterResource => {
  const now = new Date().toISOString();
  return {
    name: values.name,
    type: values.type,
    check: values.check,
    enabled: values.enabled,
    metadata: {
      title: values.name,
      author: values.author?.trim() ?? '',
      date: now,
      modified: now,
      description: values.description || '',
      documentation: values.documentation || '',
      references: values.references,
      supports: values.supports,
    },
  };
};

/** YAML string to FilterFormModel (uses lossless parsing to preserve float precision). */
export const mapYamlToForm = (yamlString: string): FilterFormModel => {
  const parsed = mapYamlToLosslessObject<any>(yamlString);
  if (!parsed) return filterFormDefaultValue;
  return mapYamlToFilterForm(parsed);
};

export const mapFormToYaml = (values: FilterFormModel): string => {
  const doc = YAML.parseDocument(
    YAML.stringify(
      {
        name: values.name,
        type: values.type,
        check: null,
        enabled: values.enabled,
        metadata: {
          title: values.name,
          author: values.author?.trim() ?? '',
          description: values.description || '',
          documentation: values.documentation || '',
          references: values.references,
          supports: values.supports,
        },
      },
      { lineWidth: 0 }
    )
  );

  doc.set('check', stringToYamlNode(values.check));

  return doc.toString({ lineWidth: 0 });
};
