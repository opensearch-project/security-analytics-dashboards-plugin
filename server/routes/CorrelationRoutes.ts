/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupCorrelationRoutes(services: NodeServices, router: IRouter) {
  const { correlationService } = services;

  router.post(
    {
      path: `${API.CORRELATION_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    correlationService.getCorrelationRules
  );

  router.post(
    {
      path: `${API.CORRELATION_BASE}`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    correlationService.createCorrelationRule
  );

  router.put(
    {
      path: `${API.CORRELATION_BASE}/{ruleId}`,
      validate: {
        body: schema.any(),
        params: schema.object({
          ruleId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    correlationService.updateCorrelationRule
  );

  router.get(
    {
      path: `${API.FINDINGS_BASE}/correlate`,
      validate: {
        query: createQueryValidationSchema({
          finding: schema.string(),
          detector_type: schema.string(),
          nearby_findings: schema.number(),
        }),
      },
    },
    correlationService.getCorrelatedFindings
  );

  router.get(
    {
      path: `${API.CORRELATIONS}`,
      validate: {
        query: createQueryValidationSchema({
          start_time: schema.string(),
          end_time: schema.string(),
        }),
      },
    },
    correlationService.getAllCorrelationsInTimeRange
  );

  router.delete(
    {
      path: `${API.CORRELATION_BASE}/{ruleId}`,
      validate: {
        params: schema.object({
          ruleId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    correlationService.deleteCorrelationRule
  );

  router.get(
    {
      path: `${API.GET_CORRELATION_ALERTS}`,
      validate: {
        query: createQueryValidationSchema(),
      },
    },
    correlationService.getAllCorrelationAlerts
  );

  router.post(
    {
      path: `${API.ACK_CORRELATION_ALERTS}`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    correlationService.acknowledgeCorrelationAlerts
  );
}
