/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';
import { schema } from '@osd/config-schema';

export function setupIndexRoutes(services: NodeServices, router: IRouter) {
  const { indexService } = services;

  router.get(
    {
      path: API.INDICES_BASE,
      validate: {
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    indexService.getIndices
  );

  router.get(
    {
      path: API.ALIASES_BASE,
      validate: {
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    indexService.getAliases
  );

  router.post(
    {
      path: `${API.INDICES_BASE}`,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    indexService.getIndexFields
  );

  router.post(
    {
      path: API.UPDATE_ALIASES,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    indexService.updateAliases
  );
}
