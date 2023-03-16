import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';
import UpdateFieldMappings from '../../../../../public/pages/Detectors/components/UpdateFieldMappings/UpdateFieldMappings';
import { detectorServiceMock } from '../../../services/detectorService.mock';
import fieldMappingServiceMock from '../../../services/fieldMappingService.mock';

export default ({
  detectorHit: detectorHitMock,
  detectorService: detectorServiceMock,
  notifications: notificationsStartMock,
  filedMappingService: fieldMappingServiceMock,
  location: {
    state: {
      detectorHit: detectorHitMock,
    },
    pathname: '/edit-field-mappings/detector_id_1',
  },
  history: browserHistoryMock,
} as unknown) as typeof UpdateFieldMappings;
