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

  router.put(
    {
      path: `${API.POLICIES_BASE}/{policyId}`,
      validate: {
        params: schema.object({
          policyId: schema.string(),
        }),
        // query: createQueryValidationSchema({
        //   space: schema.maybe(schema.string()),
        // }),
        body: schema.object({
          author: schema.string(),
          enabled: schema.boolean({ defaultValue: false }),
          index_discarded_events: schema.boolean({ defaultValue: false }),
          index_unclassified_events: schema.boolean({ defaultValue: false }),
          description: schema.string({ defaultValue: '' }),
          documentation: schema.string({ defaultValue: '' }),
          enrichments: schema.arrayOf(schema.string(), { defaultValue: [] }),
          filters: schema.arrayOf(schema.string(), { defaultValue: [] }),
          integrations: schema.arrayOf(schema.string(), { defaultValue: [] }),
          references: schema.arrayOf(schema.string(), { defaultValue: [] }),
          title: schema.string(),
          root_decoder: schema.string({ defaultValue: '' }),
          date: schema.string(),
          modified: schema.string(),
          id: schema.string(),
        }),
      },
    },
    policiesService.updatePolicy
  );
}
