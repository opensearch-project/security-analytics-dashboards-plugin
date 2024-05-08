/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';

export function setupRulesRoutes(services: NodeServices, router: IRouter) {
  const { rulesService } = services;

  router.post(
    {
      path: `${API.RULES_BASE}/_search`,
      validate: {
        query: schema.object({
          prePackaged: schema.boolean(),
          dataSourceId: schema.maybe(schema.string()),
        }),
        body: schema.any(),
      },
    },
    rulesService.getRules
  );

  router.post(
    {
      path: `${API.RULES_BASE}`,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    rulesService.createRule
  );

  router.delete(
    {
      path: `${API.RULES_BASE}/{ruleId}`,
      validate: {
        params: schema.object({
          ruleId: schema.string(),
        }),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    rulesService.deleteRule
  );

  router.put(
    {
      path: `${API.RULES_BASE}/{ruleId}`,
      validate: {
        query: schema.object({
          category: schema.string(),
          dataSourceId: schema.maybe(schema.string()),
        }),
        body: schema.any(),
        params: schema.object({
          ruleId: schema.string(),
        }),
      },
    },
    rulesService.updateRule
  );
}
