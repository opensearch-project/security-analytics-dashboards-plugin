/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';
import { AllowedActionsBySpace, SPACE_ACTIONS } from '../../common/constants';

export function setupIntegrationRoutes(services: NodeServices, router: IRouter) {
  const { integrationService } = services;

  router.post(
    {
      path: API.INTEGRATION_BASE,
      validate: {
        body: schema.object({
          document: schema.object({
            author: schema.string(),
            category: schema.string(),
            description: schema.string({ defaultValue: '' }),
            documentation: schema.string({ defaultValue: '' }),
            references: schema.arrayOf(schema.string(), { defaultValue: [] }),
            tags: schema.nullable(
              schema.object({
                correlation_id: schema.number(),
              })
            ),
            title: schema.string(),
          }),
        }),
        query: createQueryValidationSchema(),
      },
    },
    integrationService.createIntegration
  );

  router.post(
    {
      path: `${API.INTEGRATION_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    integrationService.searchIntegrations
  );

  router.put(
    {
      path: `${API.INTEGRATION_BASE}/{integrationId}`,
      validate: {
        params: schema.object({
          integrationId: schema.string(),
        }),
        body: schema.object({
          document: schema.object({
            author: schema.string(),
            category: schema.string(),
            decoders: schema.arrayOf(schema.string(), { defaultValue: [] }),
            description: schema.string({ defaultValue: '' }),
            documentation: schema.string({ defaultValue: '' }),
            enabled: schema.boolean({ defaultValue: false }), // TODO: adapt if this can be configured by user in UI
            kvdbs: schema.arrayOf(schema.string(), { defaultValue: [] }),
            references: schema.arrayOf(schema.string(), { defaultValue: [] }),
            rules: schema.arrayOf(schema.string(), { defaultValue: [] }),
            tags: schema.nullable(
              schema.object({
                correlation_id: schema.number(),
              })
            ),
            title: schema.string(),
          }),
        }),
        query: createQueryValidationSchema(),
      },
    },
    integrationService.updateIntegration
  );

  router.get(
    {
      path: `${API.INTEGRATION_BASE}/promote/{space}`,
      validate: {
        params: schema.object({
          space: schema.oneOf(
            Object.entries(AllowedActionsBySpace)
              .filter(([_, actions]) => actions.includes(SPACE_ACTIONS.PROMOTE))
              .map(([space]) => schema.literal(space))
          ),
        }),
        query: createQueryValidationSchema(),
      },
    },
    integrationService.getPromoteBySpace
  );

  router.post(
    {
      path: `${API.INTEGRATION_BASE}/promote`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    integrationService.promoteIntegration
  );

  router.delete(
    {
      path: `${API.INTEGRATION_BASE}/{integrationId}`,
      validate: {
        params: schema.object({
          integrationId: schema.string(),
        }),
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    integrationService.deleteIntegration
  );
}
