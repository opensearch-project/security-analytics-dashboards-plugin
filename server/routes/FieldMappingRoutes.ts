/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';

export function setupFieldMappingRoutes(services: NodeServices, router: IRouter) {
  const { fieldMappingService } = services;

  router.get(
    {
      path: API.MAPPINGS_VIEW,
      validate: {
        query: schema.object({
          indexName: schema.string(),
          ruleTopic: schema.maybe(schema.string()),
        }),
      },
    },
    fieldMappingService.getMappingsView
  );

  router.get(
    {
      path: API.MAPPINGS_BASE,
      validate: {
        query: schema.object({
          indexName: schema.string(),
        }),
      },
    },
    fieldMappingService.getMappings
  );

  router.post(
    {
      path: API.MAPPINGS_BASE,
      validate: {
        body: schema.any(),
      },
    },
    fieldMappingService.createMappings
  );
}
