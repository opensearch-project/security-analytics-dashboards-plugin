import { FieldMapping } from '../../../../../models/interfaces';
import { mockDetector } from '../../containers/Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';

const mockFieldMapping: FieldMapping = {
  indexFieldName: 'indexFieldName',
  ruleFieldName: 'ruleFieldName',
};

export default {
  detector: mockDetector,
  existingMappings: [mockFieldMapping, mockFieldMapping],
  editFieldMappings: jest.fn(),
  notifications: mockNotificationsStart,
};
