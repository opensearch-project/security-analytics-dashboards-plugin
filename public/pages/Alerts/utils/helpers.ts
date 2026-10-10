/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertsSortField, Duration, GetAlertsParams } from '../../../../types';
import { MAX_ALERTS_RESULT_WINDOW } from '../../../utils/constants';
import { ALERTS_SEARCH_STRING_MAX_LENGTH } from '../../../../common/constants';

export const ALERTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface AlertsTableQuery {
  pageIndex: number;
  pageSize: number;
  sortField: AlertsSortField;
  sortDirection: 'asc' | 'desc';
  severities: string[];
  statuses: string[];
  search: string;
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
 * Builds the get alerts params for one page of the detection rule alerts table. Requests never go
 * past the max result window of the backend.
 */
export const getAlertsPageParams = (
  query: AlertsTableQuery,
  duration?: Duration,
  detectorId?: string
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

  return params;
};
