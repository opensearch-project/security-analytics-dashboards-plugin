/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';

export function setupAlertsRoutes(services: NodeServices, router: IRouter) {
  const { alertService } = services;

  router.get(
    {
      path: `${API.GET_ALERTS}`,
      validate: {
        query: schema.object({
          detectorType: schema.maybe(schema.string()),
          detectorId: schema.maybe(schema.string()),
        }),
      },
    },
    alertService.getAlerts
  );
}
