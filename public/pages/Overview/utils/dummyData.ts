/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FindingItem } from '../types/interfaces';
import { TopLevelSpec } from 'vega-lite';

export const dummyWidgetItems: FindingItem[] = Array(5)
  .fill(undefined)
  .map((_, idx) => {
    return {
      id: idx,
      time: new Date().toDateString(),
      findingName: `Finding ${idx}`,
      detector: `policy_${idx % 3}`,
    };
  });

export function getVisualizationSpec() {
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Plot showing average data with raw values in the background.',
    data: { url: 'https://vega.github.io/editor/data/stocks.csv' },
    transform: [{ filter: { or: ["datum.symbol==='AMZN'", "datum.symbol==='IBM'"] } }],
    layer: [
      {
        mark: 'bar',
        encoding: {
          x: { timeUnit: 'yearmonth', field: 'date' },
          y: { aggregate: 'average', field: 'price', type: 'quantitative' },
          color: { field: 'symbol', type: 'nominal', title: 'Symbol' },
        },
      },
      {
        mark: 'line',
        encoding: {
          x: { timeUnit: 'yearmonth', field: 'date' },
          y: { aggregate: 'min', field: 'price' },
        },
      },
    ],
  };

  return spec;
}
