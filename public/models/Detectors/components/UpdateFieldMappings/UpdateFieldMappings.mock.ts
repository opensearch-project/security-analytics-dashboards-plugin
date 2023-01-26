import { mockDetectorHit, notificationsStart } from '../../../Interfaces.mock';
import { DetectorsService } from '../../../../services';
import FieldMappingService from '../../../../services/FieldMappingService';

const fieldMappingService: FieldMappingService = {
  createMappings: () => {
    return Promise.resolve({
      ok: true,
    });
  },
  getMappingsView: () => {
    return {
      ok: true,
      response: {},
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

const mockDetectorService: DetectorsService = {
  getDetectors: () => {
    return {
      ok: true,
      response: {
        hits: {
          hits: [mockDetectorHit],
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
