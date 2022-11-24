/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { euiPaletteColorBlind, euiPaletteForStatus } from '@elastic/eui';
import _ from 'lodash';
import { TopLevelSpec } from 'vega-lite';
import { SummaryData } from '../components/Widgets/Summary';

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
  groupBy: string
): TopLevelSpec {
  const timeUnit = 'yearmonthdatehoursminutes';
  const aggregate = 'sum';

  return getVisualizationSpec(
    'Plot showing average data with raw values in the background.',
    visualizationData,
    [
      {
        mark: 'bar',
        encoding: {
          x: { timeUnit, field: 'time', title: '', axis: { grid: false, ticks: false } },
          y: {
            aggregate,
            field: 'finding',
            type: 'quantitative',
            title: 'Count',
            axis: { grid: true, ticks: false },
          },
          color: {
            field: _.isEmpty(groupBy) || groupBy !== 'logType' ? 'finding' : 'logType',
            type: 'nominal',
            title: groupBy === 'logType' ? 'Log type' : 'All findings',
            scale: {
              range: euiPaletteColorBlind(),
            },
          },
        },
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

export function getFindingsVisualizationSpec(visualizationData: any[], groupBy: string) {
  return getVisualizationSpec('Findings data overview', visualizationData, [
    {
      mark: 'bar',
      encoding: {
        x: {
          timeUnit: 'yearmonthdatehoursminutes',
          field: 'time',
          title: '',
          axis: { grid: false, ticks: false },
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
    },
  ]);
}

export function getAlertsVisualizationSpec(visualizationData: any[], groupBy: string) {
  return getVisualizationSpec('Alerts data overview', visualizationData, [
    {
      mark: 'bar',
      encoding: {
        x: {
          timeUnit: 'yearmonthdatehoursminutes',
          field: 'time',
          title: '',
          axis: { grid: false, ticks: false },
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
    },
  ]);
}

export function getTopRulesVisualizationSpec(visualizationData: any[]) {
  return getVisualizationSpec('Most frequent detection rules', visualizationData, [
    {
      mark: { type: 'arc', innerRadius: 90 },
      encoding: {
        theta: { aggregate: 'sum', field: 'count', type: 'quantitative' },
        color: {
          field: 'ruleName',
          type: 'nominal',
          header: { title: '' },
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
