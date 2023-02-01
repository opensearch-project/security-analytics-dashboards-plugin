import { mockDetectorHit } from '../../containers/Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';
import { mockHistory } from '../../../index';

export default {
  notifications: mockNotificationsStart,
  detectorHit: mockDetectorHit,
  location: {
    pathname: '/edit-detector-details/detectorHitId',
  },
  history: mockHistory,
};
