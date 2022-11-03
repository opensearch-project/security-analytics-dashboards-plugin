/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TopLevelSpec } from 'vega-lite';
import { SummaryData } from '../components/Widgets/Summary';

function getVisualizationSpec(description: string, data: any, layers: any[]) {
  let spec: Partial<TopLevelSpec> = {
    config: { view: { stroke: null } },
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: description,
    data: {
      values: data,
    },
  };

  if (layers.length > 1) {
    spec['layer'] = layers;
  } else if (layers.length === 1) {
    spec = {
      ...spec,
      ...layers[0],
    };
  }

  return spec as TopLevelSpec;
}

export function getOverviewVisualizationSpec(
  visualizationData: SummaryData[],
  groupBy: string
): TopLevelSpec {
  const timeUnit = 'yearmonthdatehoursminutes';
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
