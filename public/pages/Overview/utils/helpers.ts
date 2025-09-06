/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import dateMath from '@elastic/datemath';
import _ from 'lodash';
import { DEFAULT_DATE_RANGE } from '../../../utils/constants';
import moment from 'moment';
import { euiThemeVars } from '@osd/ui-shared-deps/theme';

export interface TimeUnit {
  unit: string;
  step: number;
}

export interface TimeUnits {
  timeUnit: TimeUnit;
  dateFormat: string;
}

export type DateOpts = {
  timeUnit: TimeUnit;
  dateFormat: string;
  domain?: number[];
};

/**
 * Legend selection config for the chart layer
 */
export const legendSelectionCfg = {
  selection: {
    series: {
      type: 'multi',
      encodings: ['color'],
      on: 'click',
      bind: 'legend',
    },
  },
  encoding: {
    opacity: {
      condition: { selection: 'series', value: 1 },
      value: 0.2,
    },
  },
};

export const defaultTimeUnit = {
  unit: 'yearmonthdatehoursminutes',
  step: 1,
};

export const defaultDateFormat = '%Y-%m-%d %H:%M';

// euiColorDanger: #BD271E
export const alertsDefaultColor = euiThemeVars.euiColorDanger;

export const parseDateString = (dateString: string): number => {
  const date = dateMath.parse(dateString);
  return date ? date.toDate().getTime() : new Date().getTime();
};

export const defaultScaleDomain = [
  parseDateString(DEFAULT_DATE_RANGE.start),
  parseDateString(DEFAULT_DATE_RANGE.end),
];

export const getYAxis = (field: string, title: string, axisGrid: boolean = true, opts: any = {}) =>
  _.defaultsDeep(opts, {
    aggregate: 'sum',
    field: field,
    type: 'quantitative',
    title: title,
    axis: { grid: axisGrid },
  });

export const getXAxis = (dateOpts: DateOpts, opts: any = {}) =>
  _.defaultsDeep(opts, {
    timeUnit: dateOpts.timeUnit,
    field: 'time',
    title: '',
    type: 'temporal',
    axis: { grid: false, format: dateOpts.dateFormat },
    scale: {
      domain: dateOpts.domain,
    },
  });

export const getTimeTooltip = (dateOpts: DateOpts) => ({
  timeUnit: dateOpts.timeUnit,
  field: 'time',
  type: 'temporal',
  title: 'Time',
  format: '%Y-%m-%d %H:%M:%S',
});

/**
 * Recalculates vertical domain range to add a bit of space
 * so that the topmost items in the chart are not clipped
 * @param {any} data
 * @param {string} timeUnit
 */
export const getYDomainRange = (data: any[], timeUnit: string): number[] => {
  data = data.filter((item) => item.finding === 1);

  let dateFormat = 'mm';
  const timeUnitSize = timeUnit.match(/.*(seconds|minutes|hours|date|month|year)$/);
  if (timeUnitSize && timeUnitSize[1]) {
    dateFormat = `${timeUnitSize[1][0]}${timeUnitSize[1][0]}`;
  }
  let dataGroups = _.groupBy(data, (item) => moment(item.time).format(dateFormat));
  const domainMax = _.maxBy(Object.values(dataGroups), (group) => group.length) || [];
  return [0, domainMax.length + 0.1];
};

export function getTimeWithMinPrecision(time: number | string) {
  const date = new Date(time);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.getTime();
}

/**
 * Returns timeUnit based on how big time diff is between start and end dates
 * @param start Chart start time
 * @param end Chart end time
 * @param [defaultUnit = 'yearmonthdatehoursminutes'] Default timeUnit
 */
export function getChartTimeUnit(
  start: string,
  end: string,
  defaultUnit: string = 'yearmonthdatehoursminutes'
): TimeUnits {
  const startMoment = dateMath.parse(start);
  const endMoment = dateMath.parse(end);
  let timeUnit: string = defaultUnit;
  let dateFormat: string = '%Y-%m-%d %H:%M';

  if (!startMoment || !endMoment)
    return {
      timeUnit: { unit: timeUnit, step: 1 },
      dateFormat,
    };

  try {
    const milliseconds = endMoment.diff(startMoment);

    const second = 1001; // set 1ms as a threshold since moment can make a mistake in 1 ms when calculating start and end datetime
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;

    if (milliseconds <= minute) {
      timeUnit = 'yearmonthdatehoursminutesseconds';
      dateFormat = '%Y-%m-%d %H:%M:%S';
    } else if (milliseconds <= hour) {
      timeUnit = 'yearmonthdatehoursminutes';
      dateFormat = '%Y-%m-%d %H:%M';
    } else if (milliseconds <= day * 2) {
      timeUnit = 'yearmonthdatehours';
      dateFormat = '%Y-%m-%d %H:%M';
    } else if (milliseconds <= month * 6) {
      timeUnit = 'yearmonthdate';
      dateFormat = '%Y-%m-%d';
    } else if (milliseconds <= year * 2) {
      timeUnit = 'yearmonth';
      dateFormat = '%Y-%m';
    } else if (milliseconds <= year * 6) {
      timeUnit = 'yearquarter';
      dateFormat = '%Y';
    } else {
      timeUnit = 'year';
      dateFormat = '%Y';
    }
  } catch (e) {
    console.error(`Time diff can't be calculated for dates: ${start} and ${end}`);
  }
  return {
    timeUnit: _.assign(
      {
        step: 1,
      },
      { unit: timeUnit }
    ),
    dateFormat,
  };
}

/**
 * Adds interactive legends to the chart layer
 * @param layer
 */
export const addInteractiveLegends = (layer: any) => _.defaultsDeep(layer, legendSelectionCfg);

export const getDomainRange = (
  range: string[] = [DEFAULT_DATE_RANGE.start, DEFAULT_DATE_RANGE.end],
  timeUnit?: string
): number[] => {
  const start: number = parseDateString(range[0] || DEFAULT_DATE_RANGE.start);
  let rangeEnd = range[1] || DEFAULT_DATE_RANGE.end;
  if (timeUnit) {
    const timeUnitSize = timeUnit.match(/.*(seconds|minutes|hours|date|month|year)$/);
    if (timeUnitSize && timeUnitSize[1]) {
      // `||` is the separator which the datemath's parse method will use to split the dates for
      // the addition.
      rangeEnd = `${range[1]}||+1${timeUnitSize[1][0]}`;
    }
  }
  const end: number = parseDateString(rangeEnd);
  return [start, end];
};
