/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const RULE_KEYWORD_SEARCH_FIELDS = [
  'document.title',
  'document.author',
  'document.level',
  'document.logsource.category',
  'document.logsource.product',
  'document.logsource.service',
];

const RULE_TEXT_SEARCH_FIELDS = ['document.description'];

const escapeWildcard = (str: string) => str.replace(/[*?]/g, '\\$&');

export const buildRulesSearchQuery = (searchText: string) => {
  const trimmed = searchText.trim();
  if (!trimmed) {
    return { match_all: {} };
  }

  return {
    bool: {
      should: [
        ...RULE_KEYWORD_SEARCH_FIELDS.map((field) => ({
          wildcard: {
            [field]: {
              value: `*${escapeWildcard(trimmed)}*`,
              case_insensitive: true,
            },
          },
        })),
        ...RULE_TEXT_SEARCH_FIELDS.map((field) => ({
          match_phrase: {
            [field]: trimmed,
          },
        })),
      ],
      minimum_should_match: 1,
    },
  };
};
