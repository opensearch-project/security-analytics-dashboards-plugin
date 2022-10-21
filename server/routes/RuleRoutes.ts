/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';

export function setupRuleRoutes(services: NodeServices, router: IRouter) {
  const { rulesService } = services;

  router.post(
    {
      path: API.RULES_BASE,
      validate: {
        body: schema.any(),
      },
    },
    rulesService.createRule
  );

  router.post(
    {
      path: `${API.RULES_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: schema.object({ pre_packaged: schema.string() }),
      },
    },
    rulesService.getRules
  );
}
