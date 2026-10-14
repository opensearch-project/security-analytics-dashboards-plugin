/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertsSortField, Duration, GetAlertsParams } from '../../../../types';
import { MAX_ALERTS_RESULT_WINDOW } from '../../../utils/constants';
import { ALERTS_SEARCH_STRING_MAX_LENGTH } from '../../../../common/constants';

export const ALERTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * A page beyond the numbered pages, got with the cursor of a page in cursor paging.
 */
export interface AlertsCursorPosition {
  // The cursor of the alert the page is after (next) or before (prev)
  searchAfter: string;
  direction: 'next' | 'prev';
  // Position of the first alert of the page among all matching alerts. Alerts may change between
  // pages, so it's only as exact as the alerts stay the same.
  offset: number;
}

export interface AlertsTableQuery {
  pageIndex: number;
  pageSize: number;
  sortField: AlertsSortField;
  sortDirection: 'asc' | 'desc';
  severities: string[];
  statuses: string[];
  search: string;
  // Set for pages beyond the numbered pages, see AlertsCursorPosition. pageIndex is then the last
  // numbered page.
  cursor?: AlertsCursorPosition;
}

export const DEFAULT_ALERTS_TABLE_QUERY: AlertsTableQuery = {
  pageIndex: 0,
  pageSize: ALERTS_PAGE_SIZE_OPTIONS[0],
  sortField: 'start_time',
  sortDirection: 'desc',
  severities: [],
  statuses: [],
  search: '',
};

/**
 * Maps the sortable fields of the detection rule alerts table to the fields the get alerts API
 * sorts by.
 */
export const ALERTS_TABLE_SORT_FIELDS: { [columnField: string]: AlertsSortField } = {
  start_time: 'start_time',
  detectorName: 'monitor_name.keyword',
  state: 'state',
  severity: 'severity',
};

export const getAlertsTableColumnField = (sortField: AlertsSortField) =>
  Object.keys(ALERTS_TABLE_SORT_FIELDS).find(
    (columnField) => ALERTS_TABLE_SORT_FIELDS[columnField] === sortField
  );

// Terms like the standard tokenizer of the detector and trigger name fields splits them into:
// runs of letters, marks, digits and underscores that may be joined by single `.`, `'` or `:`
// characters, e.g. `my_detector`, `win.log`, `o'neil`. Everything else separates the terms.
const ALERTS_SEARCH_TERM_REGEX = /[\p{L}\p{M}\p{N}_]+(?:[.':][\p{L}\p{M}\p{N}_]+)*/gu;

/**
 * Builds the query_string the backend uses to search the detector and trigger names. The input is
 * split into terms similar to the standard tokenizer and each term is matched as a prefix, so no
 * query string syntax of the input ever reaches the backend. `:` is the only query_string reserved
 * character a term can contain and is escaped. Terms that would exceed the max length of the search
 * string are dropped.
 * e.g. 'a-b:c (d)' -> 'a* b\:c* d*'
 */
export const getAlertsSearchString = (input: string): string => {
  const terms = input.toLowerCase().match(ALERTS_SEARCH_TERM_REGEX) ?? [];
  let searchString = '';

  for (const term of terms) {
    const prefixQuery = `${term.replace(/:/g, '\\:')}*`;
    const next = searchString ? `${searchString} ${prefixQuery}` : prefixQuery;
    if (next.length > ALERTS_SEARCH_STRING_MAX_LENGTH) {
      break;
    }
    searchString = next;
  }

  return searchString;
};

/**
 * Number of alerts on the numbered pages of the given size: they end within the max result window.
 * The alerts after them are paged with cursors, if the backend supports it.
 */
export const getNumberedAlertsLimit = (pageSize: number) =>
  pageSize > 0
    ? Math.floor(MAX_ALERTS_RESULT_WINDOW / pageSize) * pageSize
    : MAX_ALERTS_RESULT_WINDOW;

/**
 * Builds the get alerts params for one page of the detection rule alerts table. Requests never go
 * past the max result window of the backend. With cursor paging, pages beyond the numbered pages
 * are got with the cursor of the query, the numbered pages with startIndex as before.
 */
export const getAlertsPageParams = (
  query: AlertsTableQuery,
  duration?: Duration,
  detectorId?: string,
  cursorPaging: boolean = false
): GetAlertsParams => {
  const startIndex = query.pageIndex * query.pageSize;
  const size = Math.max(0, Math.min(query.pageSize, MAX_ALERTS_RESULT_WINDOW - startIndex));
  const searchString = getAlertsSearchString(query.search);
  const params: GetAlertsParams = {
    startIndex,
    size,
    sortString: query.sortField,
    sortOrder: query.sortDirection,
    startTime: duration?.startTime,
    endTime: duration?.endTime,
  };

  if (query.severities.length) {
    params.severityLevels = query.severities.join(',');
  }

  if (query.statuses.length) {
    params.alertStates = query.statuses.join(',');
  }

  if (searchString) {
    params.searchString = searchString;
  }

  if (detectorId) {
    params.detector_id = detectorId;
  }

  if (cursorPaging) {
    params.paging = 'cursor';
    if (query.cursor) {
      delete params.startIndex;
      params.size = query.pageSize;
      params.searchAfter = query.cursor.searchAfter;
      params.direction = query.cursor.direction;
    }
  }

  return params;
};
