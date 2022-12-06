/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import { TopLevelSpec } from 'vega-lite';
import { SummaryData } from '../components/Widgets/Summary';
import dateMath from '@elastic/datemath';
import { TimeUnitsMap } from './constants';
import _ from 'lodash';

export type DateOpts = {
  timeUnit: string;
  dateFormat: string;
};

function getVisualizationSpec(description: string, data: any, layers: any[]): TopLevelSpec {
  return {
    config: { view: { stroke: null } },
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: description,
    data: {
      values: data,
    },
    layer: layers,
  };
}

export function getOverviewVisualizationSpec(
  visualizationData: SummaryData[],
  groupBy: string,
  dynamicTimeUnit: string = 'yearmonthdatehoursminutes'
): TopLevelSpec {
  const timeUnit = dynamicTimeUnit;
  const aggregate = 'sum';
  const findingsEncoding: { [x: string]: any } = {
    x: { timeUnit, field: 'time', title: '', axis: { grid: false, ticks: false } },
    y: {
      aggregate,
      field: 'finding',
      type: 'quantitative',
      title: 'Count',
      axis: { grid: true, ticks: false },
    },
  };

  if (groupBy === 'log_type') {
    findingsEncoding['color'] = { field: 'logType', type: 'nominal', title: 'Log type' };
  }

  return getVisualizationSpec(
    'Plot showing average data with raw values in the background.',
    visualizationData,
    [
      {
        mark: 'bar',
        encoding: findingsEncoding,
      },
      {
        mark: {
          type: 'line',
          color: '#ff0000',
        },
        encoding: {
          x: { timeUnit, field: 'time', title: '', axis: { grid: false, ticks: false } },
          y: { aggregate, field: 'alert', title: 'Count', axis: { grid: true, ticks: false } },
        },
      },
    ]
  );
}

/**
 * Returns chart x-axis date format based on time span
 * @param start
 * @param end
 */
export function getDateFormatByTimeUnit(start: string, end: string) {
  const startMoment = dateMath.parse(start);
  const endMoment = dateMath.parse(end);
  let dateFormat = '%Y-%m-%d %H:%M';

  if (startMoment && endMoment) {
    const startData = startMoment.toObject();
    const endData = endMoment.toObject();
    const dateDiff = endMoment.diff(startMoment);
    const momentDiff = moment.duration(dateDiff);
    const daysDiff = _.get(momentDiff, '_data.days', 0);

    if (startData.years === endData.years) {
      if (startData.months !== endData.months) {
        dateFormat = '%Y-%m-%d';

        if (daysDiff < 30 && daysDiff > 1) {
          dateFormat = '%Y-%m-%d %H:%M';
        }
      } else {
        dateFormat = '%Y-%m-%d %H:%M';

        if (startData.date === endData.date) {
          dateFormat = '%H:%M:%S';
        }
      }
    }
  }

  return dateFormat;
}

export function getFindingsVisualizationSpec(
  visualizationData: any[],
  groupBy: string,
  dateOpts: DateOpts = {
    timeUnit: 'yearmonthdatehoursminutes',
    dateFormat: '%Y-%m-%d %H:%M',
  }
) {
  return getVisualizationSpec('Findings data overview', visualizationData, [
    {
      mark: 'bar',
      encoding: {
        x: {
          timeUnit: dateOpts.timeUnit,
          field: 'time',
          title: '',
          axis: {
            grid: false,
            format: dateOpts.dateFormat,
          },
        },
        y: {
          aggregate: 'sum',
          field: 'finding',
          type: 'quantitative',
          title: 'Count',
          axis: { grid: true, ticks: false },
        },
        color: {
          field: groupBy,
          type: 'nominal',
          title: groupBy === 'logType' ? 'Log type' : 'Rule severity',
        },
      },
    },
  ]);
}

export function getAlertsVisualizationSpec(
  visualizationData: any[],
  groupBy: string,
  dateOpts: DateOpts = {
    timeUnit: 'yearmonthdatehoursminutes',
    dateFormat: '%Y-%m-%d %H:%M',
  }
) {
  return getVisualizationSpec('Alerts data overview', visualizationData, [
    {
      mark: 'bar',
      encoding: {
        x: {
          timeUnit: dateOpts.timeUnit,
          field: 'time',
          title: '',
          axis: {
            grid: false,
            ticks: false,
            format: dateOpts.dateFormat,
          },
        },
        y: {
          aggregate: 'sum',
          field: 'alert',
          type: 'quantitative',
          title: 'Count',
          axis: { grid: true, ticks: false },
        },
        color: {
          field: groupBy,
          type: 'nominal',
          title: groupBy === 'status' ? 'Alert status' : 'Alert severity',
        },
      },
    },
  ]);
}

export function getTopRulesVisualizationSpec(visualizationData: any[]) {
  return getVisualizationSpec('Most frequent detection rules', visualizationData, [
    {
      mark: { type: 'arc', innerRadius: 90 },
      encoding: {
        theta: { aggregate: 'sum', field: 'count', type: 'quantitative' },
        color: { field: 'ruleName', type: 'nominal', header: { title: '' } },
      },
    },
  ]);
}

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
): string {
  const startMoment = dateMath.parse(start);
  const endMoment = dateMath.parse(end);
  let minUnit: string = 'minutes';
  let timeUnit: string = TimeUnitsMap[minUnit];

  if (!startMoment || !endMoment) return defaultUnit;

  try {
    const timeDiff = endMoment.diff(startMoment);
    const momentTimeDiff = moment.duration(timeDiff);

    const timeUnits: string[] = ['years', 'months', 'days', 'hours', 'minutes'];
    for (const unit of timeUnits) {
      // @ts-ignore
      if (momentTimeDiff._data[unit]) {
        timeUnit = TimeUnitsMap[unit];
        break;
      }
    }
  } catch (e) {
    console.error(`Time diff can't be calculated for dates: ${start} and ${end}`);
  }

  return timeUnit;
}
