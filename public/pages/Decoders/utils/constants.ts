/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const KEYWORD_SEARCH_FIELDS = [
  'document.name',
  'document.metadata.module',
  'document.metadata.compatibility',
  'document.metadata.versions',
  'document.metadata.author.name',
];

const TEXT_SEARCH_FIELDS = ['document.metadata.title', 'document.metadata.description'];

const escapeWildcard = (str: string) => str.replace(/[*?]/g, '\\$&');

export const buildDecodersSearchQuery = (searchText: string) => {
  const trimmed = searchText.trim();
  if (!trimmed) {
    return { match_all: {} };
  }

  return {
    bool: {
      should: [
        ...KEYWORD_SEARCH_FIELDS.map((field) => ({
          wildcard: {
            [field]: {
              value: `*${escapeWildcard(trimmed)}*`,
              case_insensitive: true,
            },
          },
        })),
        ...TEXT_SEARCH_FIELDS.map((field) => ({
          match_phrase: {
            [field]: trimmed,
          },
        })),
      ],
      minimum_should_match: 1,
    },
  };
};
