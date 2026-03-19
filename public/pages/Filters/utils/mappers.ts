/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { FilterDocument, FilterResource } from '../../../../types/Filters';

export interface FilterFormModel {
  name: string;
  type: string;
  check: string;
  enabled: boolean;
  description: string;
  author: string;
}

export const filterFormDefaultValue: FilterFormModel = {
  name: '',
  type: 'pre-filter',
  check: '',
  enabled: true,
  description: '',
  author: '',
};

export const mapFilterToForm = (document: FilterDocument): FilterFormModel => {
  const author = document.metadata?.author;
  return {
    name: document.name ?? '',
    type: document.type ?? '',
    check: document.check ?? '',
    enabled: document.enabled ?? true,
    description: document.metadata?.description ?? '',
    author: typeof author === 'string' ? author : (author?.name ?? ''),
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
      references: [],
      documentation: '',
      supports: [],
    },
  };
};
