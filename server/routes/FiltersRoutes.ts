/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

const filterBodySchema = schema.object({ space: schema.string(), resourceYaml: schema.string() });

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
        body: filterBodySchema,
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
        body: filterBodySchema,
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
