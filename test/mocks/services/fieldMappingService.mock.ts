/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import FieldMappingService from '../../../public/services/FieldMappingService';
import httpClientMock from './httpClient.mock';

const fieldMappingService = new FieldMappingService(httpClientMock);
Object.assign(fieldMappingService, {
  getMappingsView: () =>
    Promise.resolve({
      ok: true,
      response: {
        unmapped_field_aliases: [],
        properties: {},
      },
    }),
  getMappings: () =>
    Promise.resolve({
      ok: true,
      response: {
        '.windows': {
          mappings: {
            properties: {},
          },
        },
      },
    }),
});

export default fieldMappingService as FieldMappingService;
