/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';

export function setupNotificationsRoutes(services: NodeServices, router: IRouter) {
  const { notificationsService } = services;

  router.get(
    {
      path: `${API.CHANNELS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    notificationsService.getChannel
  );

  router.get(
    {
      path: API.CHANNELS,
      validate: {
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    notificationsService.getChannels
  );

  router.get(
    {
      path: API.NOTIFICATION_FEATURES,
      validate: {
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    notificationsService.getNotificationsFeatures
  );
}
