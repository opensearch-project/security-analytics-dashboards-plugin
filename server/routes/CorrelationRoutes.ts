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
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    correlationService.getCorrelationRules
  );

  router.post(
    {
      path: `${API.CORRELATION_BASE}`,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
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
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    correlationService.updateCorrelationRule
  );

  router.get(
    {
      path: `${API.FINDINGS_BASE}/correlate`,
      validate: {
        query: schema.object({
          finding: schema.string(),
          detector_type: schema.string(),
          nearby_findings: schema.number(),
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    correlationService.getCorrelatedFindings
  );

  router.get(
    {
      path: `${API.CORRELATIONS}`,
      validate: {
        query: schema.object({
          start_time: schema.string(),
          end_time: schema.string(),
          dataSourceId: schema.maybe(schema.string()),
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
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    correlationService.deleteCorrelationRule
  );
}
