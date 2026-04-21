/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

/*
FIXME: These schemas are no longer used to validate the create and update endpoints, 
      we should create new validation here or validate the decoder in the server endpoint.

const decoderMetadataSchema = schema.object({
  title: schema.string(),
  author: schema.string(),
  date: schema.maybe(schema.string()),
  modified: schema.maybe(schema.string()),
  description: schema.maybe(schema.string()),
  references: schema.maybe(schema.arrayOf(schema.string())),
  documentation: schema.maybe(schema.string()),
  supports: schema.maybe(schema.arrayOf(schema.string())),
  module: schema.maybe(schema.string()),
  compatibility: schema.maybe(schema.string()),
  versions: schema.maybe(schema.string()),
});

const decoderDocumentSchema = schema.object(
  {
    id: schema.maybe(schema.string()),
    name: schema.string(),
    enabled: schema.maybe(schema.boolean()),
    metadata: decoderMetadataSchema,
    definitions: schema.maybe(schema.any()),
    check: schema.maybe(schema.any()),
    parents: schema.maybe(schema.arrayOf(schema.string())),
    normalize: schema.maybe(schema.any()),
    decoder: schema.maybe(schema.any()),
    // Legacy/decoder-specific fields from form
    description: schema.maybe(schema.string()),
    source: schema.maybe(schema.string()),
    program_name: schema.maybe(schema.string()),
    order: schema.maybe(schema.number()),
    fields: schema.maybe(schema.any()),
    parent: schema.maybe(schema.string()),
    regex: schema.maybe(schema.string()),
    prematch: schema.maybe(schema.string()),
  },
  {
    // WORKAROUND: This allows us to accept additional fields in the decoder document such as the parse|anything or other wrong fields. The engine should thrown an error for unknown fields.
    // This could be enhanced with a custom validation function that checks the known and the parse|anything dynamic field if we want the validation in the dashboard endpoint instead of the engine.
    unknowns: 'allow',
  }
);
*/

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
        body: schema.any(),
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
        body: schema.any(),
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
