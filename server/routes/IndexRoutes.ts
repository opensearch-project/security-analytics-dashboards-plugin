/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';

export function setupIndexRoutes(services: NodeServices, router: IRouter) {
  const { indexService } = services;

  router.get(
    {
      path: API.INDICES_BASE,
      validate: {},
    },
    indexService.getIndices
  );
}
