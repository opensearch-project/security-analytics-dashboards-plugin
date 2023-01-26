import { mockDetectorHit, notificationsStart } from '../../../Interfaces.mock';

export default {
  notifications: notificationsStart,
  detectorHit: mockDetectorHit,
  location: {
    pathname: '/edit-detector-details/detectorHitId',
  },
  history: {
    replace: jest.fn(),
  },
};
