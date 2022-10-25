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
      },
    },
    rulesService.createRule
  );
}
