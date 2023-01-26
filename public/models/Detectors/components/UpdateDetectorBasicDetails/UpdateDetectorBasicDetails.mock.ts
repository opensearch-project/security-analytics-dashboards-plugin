import { mockDetectorHit, mockHistory, mockNotificationsStart } from '../../../Interfaces.mock';

export default {
  notifications: mockNotificationsStart,
  detectorHit: mockDetectorHit,
  location: {
    pathname: '/edit-detector-details/detectorHitId',
  },
  history: mockHistory,
};
