import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorMock from '../../containers/Detectors/Detector.mock';
import fieldMappingMock from './FieldMapping.mock';
import { FieldMappingsView } from '../../../../../public/pages/Detectors/components/FieldMappingsView/FieldMappingsView';

export default ({
  detector: detectorMock,
  existingMappings: [fieldMappingMock, fieldMappingMock],
  editFieldMappings: jest.fn(),
  notifications: notificationsStartMock,
} as unknown) as typeof FieldMappingsView;
