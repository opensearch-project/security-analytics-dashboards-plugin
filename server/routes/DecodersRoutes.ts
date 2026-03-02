/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupDecodersRoutes(services: NodeServices, router: IRouter) {
  const { decodersService } = services;

  router.post(
    {
      path: `${API.DECODERS_BASE}/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    decodersService.searchDecoders
  );

  router.get(
    {
      path: `${API.DECODERS_BASE}/{decoderId}`,
      validate: {
        params: schema.object({
          decoderId: schema.string(),
        }),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    decodersService.getDecoder
  );

  router.post(
    {
      path: `${API.DECODERS_BASE}`,
      validate: {
        body: schema.object({
          document: schema.any(),
          integrationId: schema.string(),
        }),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    decodersService.createDecoder
  );

  router.put(
    {
      path: `${API.DECODERS_BASE}/{decoderId}`,
      validate: {
        params: schema.object({
          decoderId: schema.string(),
        }),
        body: schema.object({
          document: schema.any(),
        }),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    decodersService.updateDecoder
  );

  router.delete(
    {
      path: `${API.DECODERS_BASE}/{decoderId}`,
      validate: {
        params: schema.object({
          decoderId: schema.string(),
        }),
        query: createQueryValidationSchema({
          space: schema.maybe(schema.string()),
        }),
      },
    },
    decodersService.deleteDecoder
  );

  router.get(
    {
      path: `${API.DECODERS_BASE}/integrations/draft`,
      validate: {
        query: createQueryValidationSchema(),
      },
    },
    decodersService.getDraftIntegrations
  );
}
