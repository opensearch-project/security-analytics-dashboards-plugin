/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_RULE_UUID = '25b9c01c-350d-4b95-bed1-836d04a4f324';

export enum ThreatIntelIocSourceType {
  S3_CUSTOM = 'S3_CUSTOM',
  IOC_UPLOAD = 'IOC_UPLOAD',
  URL_DOWNLOAD = 'URL_DOWNLOAD',
}

/**
 * Fields the get alerts API can sort the alerts by: start time, detector name, status and severity.
 * The backend only supports these fields for the alerts of all detectors.
 */
export const ALERTS_SORT_FIELDS = [
  'start_time',
  'monitor_name.keyword',
  'state',
  'severity',
] as const;

// The backend rejects alert queries whose startIndex + size exceeds this result window.
export const MAX_ALERTS_RESULT_WINDOW = 10000;

/**
 * Max length of the search string of the get alerts API.
 */
export const ALERTS_SEARCH_STRING_MAX_LENGTH = 256;

/**
 * Characters the search string of the get alerts API may contain: what the alerts search of the
 * client emits (letters, marks, digits, `_`, `.`, `'`, escaped `:`, the `*` prefix wildcard and
 * spaces between the terms). Everything else is query_string syntax and rejected.
 */
export const ALERTS_SEARCH_STRING_PATTERN = /^[\p{L}\p{M}\p{N}_.':\\* ]*$/u;

/**
 * Cursor paging of the get alerts API (paging=cursor): pages beyond the max result window are got
 * with the next or previous cursor of a page (searchAfter) and a direction. Cursors are opaque
 * base64url strings of at most this length.
 */
export const ALERTS_CURSOR_MAX_LENGTH = 2048;

export const ALERTS_CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/;

// Max page size of the get alerts API in cursor paging
export const ALERTS_CURSOR_MAX_PAGE_SIZE = 1000;
