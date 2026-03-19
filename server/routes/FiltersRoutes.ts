/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

const filterResourceSchema = schema.object({
  name: schema.string(),
  enabled: schema.maybe(schema.boolean()),
  check: schema.maybe(schema.string()),
  type: schema.maybe(schema.string()),
  metadata: schema.maybe(
    schema.object({
      title: schema.maybe(schema.string()),
      description: schema.maybe(schema.string()),
      author: schema.maybe(schema.string()),
      date: schema.maybe(schema.string()),
      modified: schema.maybe(schema.string()),
      references: schema.maybe(schema.arrayOf(schema.string())),
      documentation: schema.maybe(schema.string()),
      supports: schema.maybe(schema.arrayOf(schema.string())),
    })
  ),
});

export function setupFiltersRoutes(services: NodeServices, router: IRouter) {
  const { filtersService } = services;

  router.post(
    {
      path: `${API.FILTERS_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    filtersService.searchFilters
  );

  router.post(
    {
      path: `${API.FILTERS_BASE}`,
      validate: {
        body: schema.object({
          space: schema.string(),
          resource: filterResourceSchema,
        }),
        query: createQueryValidationSchema(),
      },
    },
    filtersService.createFilter
  );

  router.put(
    {
      path: `${API.FILTERS_BASE}/{filterId}`,
      validate: {
        params: schema.object({ filterId: schema.string() }),
        body: schema.object({
          space: schema.string(),
          resource: filterResourceSchema,
        }),
        query: createQueryValidationSchema(),
      },
    },
    filtersService.updateFilter
  );

  router.delete(
    {
      path: `${API.FILTERS_BASE}/{filterId}`,
      validate: {
        params: schema.object({ filterId: schema.string() }),
        query: createQueryValidationSchema(),
      },
    },
    filtersService.deleteFilter
  );
}
