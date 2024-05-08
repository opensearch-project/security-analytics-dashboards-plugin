/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { schema } from '@osd/config-schema';

export function setupMetricsRoutes(services: NodeServices, router: IRouter) {
  const { metricsService } = services;
  router.get(
    {
      path: `${API.METRICS}`,
      validate: {
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    metricsService.getMetrics
  );

  router.post(
    {
      path: `${API.METRICS}`,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    metricsService.updateMetrics
  );
}
