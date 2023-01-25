import { FieldMapping } from '../../../../../models/interfaces';
import { detectorMock, notificationsStart } from '../../../Interfaces.mock';

const fieldMapping: FieldMapping = {
  indexFieldName: 'indexFieldName',
  ruleFieldName: 'ruleFieldName',
};
export default {
  detector: detectorMock,
  existingMappings: [fieldMapping, fieldMapping],
  editFieldMappings: jest.fn(),
  notifications: notificationsStart,
};
