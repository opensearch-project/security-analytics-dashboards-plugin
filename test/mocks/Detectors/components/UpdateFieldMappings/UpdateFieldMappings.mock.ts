import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import services from '../../../services';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';
import UpdateFieldMappings from '../../../../../public/pages/Detectors/components/UpdateFieldMappings/UpdateFieldMappings';

const { detectorService, fieldMappingService } = services;

export default ({
  detectorHit: detectorHitMock,
  detectorService: detectorService,
  notifications: notificationsStartMock,
  filedMappingService: fieldMappingService,
  location: {
    state: {
      detectorHit: detectorHitMock,
    },
    pathname: '/edit-field-mappings/detector_id_1',
  },
  history: browserHistoryMock,
} as unknown) as typeof UpdateFieldMappings;
