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
      path: API.GET_ALERTS,
      validate: {
        query: schema.object({
          detectorType: schema.maybe(schema.string()),
          detector_id: schema.maybe(schema.string()),
          sortOrder: schema.maybe(schema.string()),
          size: schema.maybe(schema.number()),
          startIndex: schema.maybe(schema.number()),
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    alertService.getAlerts
  );

  router.post(
    {
      path: API.ACKNOWLEDGE_ALERTS,
      validate: {
        params: schema.object({
          detector_id: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    alertService.acknowledgeAlerts
  );
}
