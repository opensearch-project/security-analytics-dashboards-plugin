/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const KVDBS_PAGE_SIZE = 25;
export const KVDBS_SORT_FIELD = 'document.metadata.title';

export const KVDBS_SEARCH_SCHEMA = {
  strict: true,
  fields: {
    'document.metadata.author': {
      type: 'string',
    },
    'document.metadata.date': {
      type: 'date',
    },
    'document.enabled': {
      type: 'boolean',
    },
    'document.id': {
      type: 'string',
    },
    'document.metadata.references': {
      type: 'string',
    },
    'document.metadata.title': {
      type: 'string',
    },
  },
};
