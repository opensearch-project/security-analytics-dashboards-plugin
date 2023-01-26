import { FieldMapping } from '../../../../../models/interfaces';
import { mockDetector, mockNotificationsStart } from '../../../Interfaces.mock';

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
