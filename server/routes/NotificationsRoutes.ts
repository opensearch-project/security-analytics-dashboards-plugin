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
      },
    },
    notificationsService.getChannel
  );

  router.get(
    {
      path: API.CHANNELS,
      validate: false,
    },
    notificationsService.getChannels
  );
}
