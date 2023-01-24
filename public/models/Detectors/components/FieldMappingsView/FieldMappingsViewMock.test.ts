import { FieldMapping } from '../../../../../models/interfaces';
import { detectorMock } from '../../InterfacesMock.test';
const notificationsStart = {
  toasts: [],
};

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
