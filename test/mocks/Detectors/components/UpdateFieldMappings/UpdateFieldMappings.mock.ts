import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import services from '../../../services';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';

const { detectorService, fieldMappingService } = services;

export default {
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
};
