/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';

export function setupLogTypeRoutes(services: NodeServices, router: IRouter) {
  const { logTypeService } = services;

  router.post(
    {
      path: API.LOGTYPE_BASE,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    logTypeService.createLogType
  );

  router.post(
    {
      path: `${API.LOGTYPE_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    logTypeService.searchLogTypes
  );

  router.put(
    {
      path: `${API.LOGTYPE_BASE}/{logTypeId}`,
      validate: {
        params: schema.object({
          logTypeId: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    logTypeService.updateLogType
  );

  router.delete(
    {
      path: `${API.LOGTYPE_BASE}/{logTypeId}`,
      validate: {
        params: schema.object({
          logTypeId: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    logTypeService.deleteLogType
  );
}
