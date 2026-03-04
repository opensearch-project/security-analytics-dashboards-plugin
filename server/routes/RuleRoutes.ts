/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupRulesRoutes(services: NodeServices, router: IRouter) {
  const { wazuhRulesService } = services; // Wazuh: use wazuh rules service

  // Wazuh: use wazuh rules service for rules routes
  router.post(
    {
      path: `${API.RULES_BASE}/_search`,
      validate: {
        query: createQueryValidationSchema({
          prePackaged: schema.boolean(),
          space: schema.maybe(schema.string()),
        }),
        body: schema.any(),
      },
    },
    wazuhRulesService.getRules
  );

  // Wazuh: use wazuh rules service for rules routes
  router.post(
    {
      path: `${API.RULES_BASE}`,
      validate: {
        body: schema.object({
          document: schema.any(),
          integrationId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    wazuhRulesService.createRule
  );

  // Wazuh: use wazuh rules service for rules routes
  router.delete(
    {
      path: `${API.RULES_BASE}/{ruleId}`,
      validate: {
        params: schema.object({
          ruleId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    wazuhRulesService.deleteRule
  );

  // Wazuh: use wazuh rules service for rules routes
  router.put(
    {
      path: `${API.RULES_BASE}/{ruleId}`,
      validate: {
        query: createQueryValidationSchema(),
        body: schema.object({
          document: schema.any(),
        }),
        params: schema.object({
          ruleId: schema.string(),
        }),
      },
    },
    wazuhRulesService.updateRule
  );
}
