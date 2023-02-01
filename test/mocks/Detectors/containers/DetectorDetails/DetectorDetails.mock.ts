import { mockDetectorHit, mockDetectorService } from '../Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';
import { mockHistory } from '../../../index';

export default {
  detectorHit: mockDetectorHit,
  detectorService: mockDetectorService,
  notifications: mockNotificationsStart,
  location: {
    pathname: '/detector-details/detectorHitId',
  },
  history: mockHistory,
};
