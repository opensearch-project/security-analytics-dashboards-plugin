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
      validate: {},
    },
    indexService.getIndices
  );

  router.post(
    {
      path: API.UPDATE_ALIASES,
      validate: {
        body: schema.any(),
      },
    },
    indexService.updateAliases
  );
}
