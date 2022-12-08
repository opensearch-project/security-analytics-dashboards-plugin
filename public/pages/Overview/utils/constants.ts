/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const summaryGroupByOptions = [
  { text: 'All findings', value: 'finding' },
  { text: 'Log type', value: 'logType' },
];

export const moreLink = 'https://opensearch.org/docs/latest/security-analytics/';

/**
 * Time axis' timeUnit map
 * for each time search unit there is a mapped chart timeUnit
 */
export const TimeUnitsMap: {
  [key: string]: string;
} = {
  minutes: 'yearmonthdatehoursminutes',
  hours: 'yearmonthdatehoursminutes',
  days: 'yearmonthdatehours',
  weeks: 'yearmonthdatehours',
  months: 'yearmonthdatehours',
  years: 'yearmonthdate',
};
