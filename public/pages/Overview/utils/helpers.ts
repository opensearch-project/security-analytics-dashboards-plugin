/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import { euiPaletteColorBlind, euiPaletteForStatus } from '@elastic/eui';
import { TopLevelSpec } from 'vega-lite';
import { SummaryData } from '../components/Widgets/Summary';
import dateMath from '@elastic/datemath';
import { TimeUnitsMap } from './constants';
import _ from 'lodash';
import { DEFAULT_DATE_RANGE } from '../../../utils/constants';

export type DateOpts = {
  timeUnit: string;
  dateFormat: string;
  domain?: number[];
};

/**
 * Legend selection config for the chart layer
 */
const legendSelectionCfg = {
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

/**
 * Adds interactive legends to the chart layer
 * @param layer
 */
const addInteractiveLegends = (layer: any) => _.defaultsDeep(layer, legendSelectionCfg);

function getVisualizationSpec(description: string, data: any, layers: any[]): TopLevelSpec {
  return {
    config: {
      view: { stroke: 'transparent' },
      legend: {
        labelColor: '#343741',
        titleColor: '#1a1c21',
        labelFontSize: 14,
        titleFontWeight: 600,
        titleLineHeight: 21,
        titleFontSize: 14,
        titlePadding: 10,
        rowPadding: 6,
        labelFont:
          '"Inter UI", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      },
    },
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
  dateOpts: DateOpts = {
    timeUnit: 'yearmonthdatehoursminutes',
    dateFormat: '%Y-%m-%d %H:%M',
  }
): TopLevelSpec {
  const aggregate = 'sum';
  const findingsEncoding: { [x: string]: any } = {
    x: {
      timeUnit: dateOpts.timeUnit,
      field: 'time',
      title: '',
      axis: { grid: false, ticks: false, format: dateOpts.dateFormat },
    },
    y: {
      aggregate,
      field: 'finding',
      type: 'quantitative',
      title: 'Count',
      axis: { grid: true, ticks: false },
    },
    tooltip: [{ field: 'finding', aggregate: 'sum', type: 'quantitative', title: 'Findings' }],
  };

  if (groupBy === 'logType') {
    findingsEncoding['color'] = {
      field: 'logType',
      type: 'nominal',
      title: 'Log type',
      scale: {
        range: euiPaletteColorBlind(),
      },
    };
  }

  const lineColor = '#ff0000';
  return getVisualizationSpec(
    'Plot showing average data with raw values in the background.',
    visualizationData,
    [
      addInteractiveLegends({
        mark: 'bar',
        encoding: findingsEncoding,
      }),
      {
        mark: {
          type: 'line',
          color: lineColor,
          point: {
            filled: true,
            fill: lineColor,
          },
        },
        encoding: {
          x: {
            timeUnit: dateOpts.timeUnit,
            field: 'time',
            title: '',
            axis: { grid: false, ticks: false, format: dateOpts.dateFormat },
          },
          y: {
            aggregate: 'sum',
            field: 'alert',
            title: 'Count',
            axis: { grid: true, ticks: false },
          },
          tooltip: [{ field: 'alert', aggregate: 'sum', title: 'Alerts' }],
        },
      },
    ]
  );
}

export const getDomainRange = (
  range: string[] = [DEFAULT_DATE_RANGE.start, DEFAULT_DATE_RANGE.end]
): number[] => {
  return [
    dateMath.parse(range[0])?.toDate().getTime(),
    dateMath.parse(range[1])?.toDate().getTime(),
  ];
};

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
    domain: [DEFAULT_DATE_RANGE.start, DEFAULT_DATE_RANGE.end],
  }
) {
  console.log('TIME UNIT', dateOpts.timeUnit);
  // dateOpts.timeUnit = 'yearmonthdatehours';
  return getVisualizationSpec('Findings data overview', visualizationData, [
    addInteractiveLegends({
      mark: {
        type: 'bar',
        strokeWidth: 1,
        stroke: 'white',
        clip: true,
      },
      encoding: {
        tooltip: [
          {
            field: 'finding',
            aggregate: 'sum',
            type: 'quantitative',
            title: 'Findings',
          },
          {
            field: 'time',
            type: 'temporal',
            title: 'Time',
            format: '%Y-%m-%d %H:%M',
          },
        ],
        x: {
          timeUnit: dateOpts.timeUnit,
          field: 'time',
          title: '',
          type: 'temporal',
          axis: {
            grid: false,
            format: dateOpts.dateFormat,
          },
          scale: {
            type: 'time',
            field: 'time',
            domain: dateOpts.domain,
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
          scale: {
            range: euiPaletteColorBlind(),
          },
        },
      },
    }),
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
    addInteractiveLegends({
      mark: 'bar',
      encoding: {
        tooltip: [{ field: 'alert', aggregate: 'sum', title: 'Alerts' }],
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
          scale: {
            range: groupBy === 'status' ? euiPaletteForStatus(5) : euiPaletteColorBlind(),
          },
        },
      },
    }),
  ]);
}

export function getTopRulesVisualizationSpec(visualizationData: any[]) {
  return getVisualizationSpec('Most frequent detection rules', visualizationData, [
    {
      mark: { type: 'arc', innerRadius: 90 },
      transform: [
        {
          joinaggregate: [
            {
              op: 'sum',
              field: 'count',
              as: 'total',
            },
          ],
        },
        {
          calculate: 'datum.count/datum.total',
          as: 'percentage',
        },
      ],
      encoding: {
        tooltip: [
          {
            field: 'percentage',
            title: 'Percentage',
            type: 'quantitative',
            format: '2.0%',
          },
        ],
        theta: { aggregate: 'sum', field: 'count', type: 'quantitative' },
        color: {
          field: 'ruleName',
          type: 'nominal',
          title: 'Rule name',
          scale: {
            range: euiPaletteColorBlind(),
          },
        },
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
  let timeUnit: string = 'yearmonthdatehoursminutes';

  if (!startMoment || !endMoment) return defaultUnit;

  try {
    const timeDiff = endMoment.diff(startMoment);
    const momentTimeDiff = moment.duration(timeDiff);

    console.log('TIME UNIT', momentTimeDiff);
    const { years, months, days, hours, minutes, seconds } = momentTimeDiff._data;

    if (!years) {
      if (!months) {
        if (!days) {
          if (!hours) {
            if (minutes < 60) {
              timeUnit = 'yearmonthdatehoursminutes';
            }
          } else {
            if (hours < 60) {
              timeUnit = 'yearmonthdatehours';
            }
          }
        } else {
          if (days === 1) {
            timeUnit = 'yearmonthdatehours';
          } else if (days <= 14) {
            timeUnit = 'yearmonthdate';
          } else {
            timeUnit = 'yearmonthdate';
          }
        }
      } else {
        if (months <= 6) {
          timeUnit = 'yearmonthdate';
        } else {
          timeUnit = 'yearmonth';
        }
      }
    } else if (years <= 6) {
      timeUnit = 'yearmonth';

      if (years > 2) {
        timeUnit = 'yearquarter';
      }
    } else {
      timeUnit = 'year';
    }
  } catch (e) {
    console.error(`Time diff can't be calculated for dates: ${start} and ${end}`);
  }

  return timeUnit;
}
