/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupRulesRoutes(services: NodeServices, router: IRouter) {
  const { rulesService } = services;

  router.post(
    {
      path: `${API.RULES_BASE}/_search`,
      validate: {
        query: createQueryValidationSchema({
          prePackaged: schema.boolean(),
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
        query: createQueryValidationSchema({
          category: schema.maybe(schema.string()),
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
        query: createQueryValidationSchema(),
      },
    },
    rulesService.deleteRule
  );

  router.put(
    {
      path: `${API.RULES_BASE}/{ruleId}`,
      validate: {
        query: createQueryValidationSchema({
          category: schema.string(),
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
