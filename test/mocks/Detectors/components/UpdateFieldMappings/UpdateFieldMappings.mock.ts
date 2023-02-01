import FieldMappingService from '../../../../../public/services/FieldMappingService';
import { mockDetectorHit, mockDetectorService } from '../../containers/Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';
import { mockHistory } from '../../../index';

export const mockFieldMappingService: FieldMappingService = {
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
  notifications: mockNotificationsStart,
  filedMappingService: mockFieldMappingService,
  location: {
    state: {
      detectorHit: mockDetectorHit,
    },
    pathname: '/edit-field-mappings/detectorHitId',
  },
  history: mockHistory,
};
