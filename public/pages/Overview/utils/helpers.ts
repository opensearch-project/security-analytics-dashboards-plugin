/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { euiPaletteColorBlind, euiPaletteForStatus } from '@elastic/eui';
import { TopLevelSpec } from 'vega-lite';
import { SummaryData } from '../components/Widgets/Summary';
import dateMath from '@elastic/datemath';
import _ from 'lodash';
import { DEFAULT_DATE_RANGE } from '../../../utils/constants';

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

export const defaultTimeUnit = {
  unit: 'yearmonthdatehoursminutes',
  step: 1,
};

export const defaultDateFormat = '%Y-%m-%d %H:%M';

export const parseDateString = (dateString: string): number => {
  const date = dateMath.parse(dateString);
  return date ? date.toDate().getTime() : new Date().getTime();
};

export const defaultScaleDomain = [
  parseDateString(DEFAULT_DATE_RANGE.start),
  parseDateString(DEFAULT_DATE_RANGE.end),
];

export const getYAxis = (field: string, title: string, axisGrid: boolean = true) => ({
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
    timeUnit: defaultTimeUnit,
    dateFormat: defaultDateFormat,
    domain: defaultScaleDomain,
  }
): TopLevelSpec {
  const findingsEncoding: { [x: string]: any } = {
    x: getXAxis(dateOpts),
    y: getYAxis('finding', 'Count'),
    tooltip: [getYAxis('finding', 'Findings'), getTimeTooltip(dateOpts)],
    color: {
      scale: null,
      value: euiPaletteColorBlind()[1],
    },
  };

  let barLayer = {
    mark: {
      type: 'bar',
      clip: true,
    },
    encoding: findingsEncoding,
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

    findingsEncoding['tooltip'].push({
      field: groupBy,
      title: groupBy === 'logType' ? 'Log type' : 'Rule severity',
    });

    barLayer = addInteractiveLegends(barLayer);
  }

  const lineColor = '#ff0000';
  return getVisualizationSpec(
    'Plot showing average data with raw values in the background.',
    visualizationData,
    [
      barLayer,
      {
        mark: {
          type: 'line',
          clip: true,
          interpolate: 'monotone',
          color: lineColor,
          point: {
            filled: false,
            fill: 'white',
            color: lineColor,
            size: 50,
          },
        },
        encoding: {
          x: getXAxis(dateOpts, {
            band: 0.5,
          }),
          y: getYAxis('alert', 'Count'),
          tooltip: [getYAxis('alert', 'Alerts'), getTimeTooltip(dateOpts)],
        },
      },
    ]
  );
}

export function getFindingsVisualizationSpec(
  visualizationData: any[],
  groupBy: string,
  dateOpts: DateOpts = {
    timeUnit: defaultTimeUnit,
    dateFormat: defaultDateFormat,
    domain: defaultScaleDomain,
  }
) {
  return getVisualizationSpec('Findings data overview', visualizationData, [
    addInteractiveLegends({
      mark: {
        type: 'bar',
        clip: true,
      },
      encoding: {
        tooltip: [
          getYAxis('finding', 'Findings'),
          getTimeTooltip(dateOpts),
          {
            field: groupBy,
            title: groupBy === 'logType' ? 'Log type' : 'Rule severity',
          },
        ],
        x: getXAxis(dateOpts),
        y: getYAxis('finding', 'Count'),
        color: {
          field: groupBy,
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
    timeUnit: defaultTimeUnit,
    dateFormat: defaultDateFormat,
    domain: defaultScaleDomain,
  }
) {
  return getVisualizationSpec('Alerts data overview', visualizationData, [
    addInteractiveLegends({
      mark: {
        type: 'bar',
        clip: true,
      },
      encoding: {
        tooltip: [
          getYAxis('alert', 'Alerts'),
          getTimeTooltip(dateOpts),
          {
            field: groupBy,
            title: groupBy === 'status' ? 'Alert status' : 'Alert severity',
          },
        ],
        x: getXAxis(dateOpts),
        y: getYAxis('alert', 'Count'),
        color: {
          field: groupBy,
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
          {
            field: 'ruleName',
            type: 'nominal',
            title: 'Rule',
          },
          getYAxis('count', 'Count'),
        ],
        theta: getYAxis('count', ''),
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
const addInteractiveLegends = (layer: any) => _.defaultsDeep(layer, legendSelectionCfg);

export const getDomainRange = (
  range: string[] = [DEFAULT_DATE_RANGE.start, DEFAULT_DATE_RANGE.end],
  timeUnit?: string
): number[] => {
  const start: number = parseDateString(range[0] || DEFAULT_DATE_RANGE.start);
  let rangeEnd = range[1] || DEFAULT_DATE_RANGE.end;
  if (timeUnit) {
    const timeUnitSize = timeUnit.match(/.*(seconds|minutes|hours|date|month|year)$/);
    if (timeUnitSize && timeUnitSize[1]) {
      rangeEnd = `now+1${timeUnitSize[1][0]}`;
    }
  }
  const end: number = parseDateString(rangeEnd);
  return [start, end];
};
