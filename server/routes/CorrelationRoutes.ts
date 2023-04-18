/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';

export function setupCorrelationRoutes(services: NodeServices, router: IRouter) {
  const { correlationService } = services;

  router.post(
    {
      path: `${API.CORRELATION_BASE}/_search`,
      validate: {
        body: schema.any(),
      },
    },
    correlationService.getCorrelationRules
  );

  router.post(
    {
      path: `${API.CORRELATION_BASE}`,
      validate: {
        body: schema.any(),
      },
    },
    correlationService.createCorrelationRule
  );

  router.delete(
    {
      path: `${API.CORRELATION_BASE}/{ruleId}`,
      validate: {
        params: schema.object({
          ruleId: schema.string(),
        }),
      },
    },
    correlationService.deleteCorrelationRule
  );
}
