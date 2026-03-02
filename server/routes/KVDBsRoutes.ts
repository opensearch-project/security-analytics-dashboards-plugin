/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

const kvdbCreateResourceSchema = schema.object({
  title: schema.string(),
  author: schema.string(),
  description: schema.maybe(schema.string()),
  documentation: schema.maybe(schema.string()),
  references: schema.maybe(schema.arrayOf(schema.string())),
  enabled: schema.maybe(schema.boolean()),
  content: schema.any(),
});

const kvdbUpdateResourceSchema = schema.object({
  title: schema.string(),
  author: schema.string(),
  description: schema.string(),
  documentation: schema.string(),
  references: schema.arrayOf(schema.string()),
  enabled: schema.maybe(schema.boolean()),
  content: schema.any(),
});

export function setupKVDBsRoutes(services: NodeServices, router: IRouter) {
  const { kvdbsService } = services;

  router.post(
    {
      path: `${API.KVDBS_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    kvdbsService.searchKVDBs
  );

  router.post(
    {
      path: `${API.KVDBS_BASE}/_integrations`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    kvdbsService.searchIntegrations
  );

  router.post(
    {
      path: `${API.KVDBS_BASE}`,
      validate: {
        body: schema.object({
          resource: kvdbCreateResourceSchema,
          integrationId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    kvdbsService.createKVDB
  );

  router.put(
    {
      path: `${API.KVDBS_BASE}/{kvdbId}`,
      validate: {
        params: schema.object({
          kvdbId: schema.string(),
        }),
        body: schema.object({
          resource: kvdbUpdateResourceSchema,
        }),
        query: createQueryValidationSchema(),
      },
    },
    kvdbsService.updateKVDB
  );

  router.delete(
    {
      path: `${API.KVDBS_BASE}/{kvdbId}`,
      validate: {
        params: schema.object({
          kvdbId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    kvdbsService.deleteKVDB
  );
}
