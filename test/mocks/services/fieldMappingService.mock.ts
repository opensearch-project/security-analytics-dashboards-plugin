import { FieldMappingService } from '../../../public/services';
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
