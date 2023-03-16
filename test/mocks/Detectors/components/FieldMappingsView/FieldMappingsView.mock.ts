import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorMock from '../../containers/Detectors/Detector.mock';
import fieldMappingMock from './FieldMapping.mock';
import { FieldMappingsViewProps } from '../../../../../public/pages/Detectors/components/FieldMappingsView/FieldMappingsView';

export default ({
  detector: detectorMock,
  existingMappings: [fieldMappingMock, fieldMappingMock],
  editFieldMappings: jest.fn(),
  notifications: notificationsStartMock,
  isEditable: true,
} as unknown) as FieldMappingsViewProps;
