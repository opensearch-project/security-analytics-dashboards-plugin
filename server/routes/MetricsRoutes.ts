/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { schema } from '@osd/config-schema';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupMetricsRoutes(services: NodeServices, router: IRouter) {
  const { metricsService } = services;
  router.get(
    {
      path: `${API.METRICS}`,
      validate: {
        query: createQueryValidationSchema(),
      },
    },
    metricsService.getMetrics
  );

  router.post(
    {
      path: `${API.METRICS}`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    metricsService.updateMetrics
  );
}
