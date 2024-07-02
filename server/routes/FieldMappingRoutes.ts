/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupFieldMappingRoutes(services: NodeServices, router: IRouter) {
  const { fieldMappingService } = services;

  router.get(
    {
      path: API.MAPPINGS_VIEW,
      validate: {
        query: createQueryValidationSchema({
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
        query: createQueryValidationSchema({
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
        query: createQueryValidationSchema(),
      },
    },
    fieldMappingService.createMappings
  );

  router.get(
    {
      path: `${API.MAPPINGS_BASE}/fields/{indexName}`,
      validate: {
        params: schema.object({
          indexName: schema.string(),
        }),
      },
    },
    fieldMappingService.getIndexAliasFields
  );
}
