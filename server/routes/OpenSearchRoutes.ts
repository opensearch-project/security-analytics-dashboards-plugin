/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';

export function setupOpensearchRoutes(services: NodeServices, router: IRouter) {
  const { opensearchService } = services;

  router.get(
    {
      path: `${API.DOCUMENT_IDS_QUERY}`,
      validate: {
        query: schema.any(),
      },
    },
    opensearchService.documentIdsQuery
  );

  router.get(
    {
      path: `${API.TIME_RANGE_QUERY}`,
      validate: {
        query: schema.any(),
      },
    },
    opensearchService.timeRangeQuery
  );

  router.get(
    {
      path: `${API.PLUGINS}`,
      validate: {
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    opensearchService.getPlugins
  );
}
