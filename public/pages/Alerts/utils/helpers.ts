/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertsSortField, Duration, GetAlertsParams } from '../../../../types';
import { MAX_ALERTS_RESULT_WINDOW } from '../../../utils/constants';

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

/**
 * Builds the query_string the backend uses to search the detector and trigger names. Only letters
 * and digits of the input are kept, so no query string syntax ever reaches the backend: the input
 * is split into tokens on every other character and each token is matched as a prefix.
 * e.g. 'a-b:c (d)' -> 'a* b* c* d*'
 */
export const getAlertsSearchString = (input: string): string =>
  input
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((token) => token.length > 0)
    .map((token) => `${token}*`)
    .join(' ');

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
