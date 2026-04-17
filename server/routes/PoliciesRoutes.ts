/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupPoliciesRoutes(services: NodeServices, router: IRouter) {
  const { policiesService } = services;

  router.post(
    {
      path: `${API.POLICIES_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    policiesService.searchPolicies
  );

  router.get(
    {
      path: `${API.POLICIES_BASE}/{policyId}`,
      validate: {
        params: schema.object({
          policyId: schema.string(),
        }),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    policiesService.getPolicy
  );

  const policyMetadataSchema = schema.object({
    title: schema.string(),
    author: schema.string(),
    description: schema.string({ defaultValue: '' }),
    documentation: schema.string({ defaultValue: '' }),
    references: schema.arrayOf(schema.string(), { defaultValue: [] }),
    compatibility: schema.arrayOf(schema.string(), { defaultValue: [] }),
  });

  router.put(
    {
      path: `${API.POLICIES_BASE}/{space}`,
      validate: {
        params: schema.object({
          space: schema.oneOf([schema.literal('draft'), schema.literal('standard')]),
        }),
        body: schema.object({
          metadata: policyMetadataSchema,
          enabled: schema.boolean({ defaultValue: false }),
          index_discarded_events: schema.boolean({ defaultValue: false }),
          index_unclassified_events: schema.boolean({ defaultValue: false }),
          enrichments: schema.arrayOf(schema.string(), { defaultValue: [] }),
          filters: schema.arrayOf(schema.string(), { defaultValue: [] }),
          integrations: schema.arrayOf(schema.string(), { defaultValue: [] }),
          root_decoder: schema.string({ defaultValue: '' }),
        }),
      },
    },
    policiesService.updatePolicy
  );

  router.delete(
    {
      path: `${API.SPACES_BASE}/{space}`,
      validate: {
        params: schema.object({
          space: schema.string(),
        }),
      },
    },
    policiesService.deleteSpace
  );
}
