/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { FilterDocument, FilterResource } from '../../../../types';

export interface FilterFormModel {
  name: string;
  type: string;
  check: string;
  enabled: boolean;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
}

export const filterFormDefaultValue: FilterFormModel = {
  name: '',
  type: 'pre-filter',
  check: '',
  enabled: true,
  description: '',
  authorName: '',
  authorEmail: '',
  authorUrl: '',
};

export const mapFilterToForm = (document: FilterDocument): FilterFormModel => ({
  name: document.name ?? '',
  type: document.type ?? '',
  check: document.check ?? '',
  enabled: document.enabled ?? true,
  description: document.metadata?.description ?? '',
  authorName: document.metadata?.author?.name ?? '',
  authorEmail: document.metadata?.author?.email ?? '',
  authorUrl: document.metadata?.author?.url ?? '',
});

export const mapFormToFilterResource = (values: FilterFormModel): FilterResource => ({
  name: values.name,
  type: values.type,
  check: values.check,
  enabled: values.enabled,
  metadata: {
    description: values.description || undefined,
    author: {
      name: values.authorName || undefined,
      email: values.authorEmail || undefined,
      url: values.authorUrl || undefined,
    },
  },
});
