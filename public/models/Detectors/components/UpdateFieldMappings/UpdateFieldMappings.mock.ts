import { mockDetectorHit, mockDetectorService, notificationsStart } from '../../../Interfaces.mock';
import FieldMappingService from '../../../../services/FieldMappingService';

export const fieldMappingService: FieldMappingService = {
  createMappings: () => {
    return Promise.resolve({
      ok: true,
    });
  },
  getMappingsView: () => {
    return {
      ok: true,
      response: {
        properties: {},
      },
    };
  },
  getMappings: () => {
    return {
      ok: true,
      response: {
        '.windows': {
          mappings: {
            properties: {},
          },
        },
      },
    };
  },
};

export default {
  detectorHit: mockDetectorHit,
  detectorService: mockDetectorService,
  notifications: notificationsStart,
  filedMappingService: fieldMappingService,
  location: {
    state: {
      detectorHit: mockDetectorHit,
    },
    pathname: '/edit-field-mappings/detectorHitId',
  },
  history: {
    replace: jest.fn(),
  },
};
