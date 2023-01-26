import { mockDetectorHit, mockDetectorService, notificationsStart } from '../../../Interfaces.mock';

export default {
  detectorHit: mockDetectorHit,
  detectorService: mockDetectorService,
  notifications: notificationsStart,
  location: {
    pathname: '/detector-details/detectorHitId',
  },
  history: {
    replace: jest.fn(),
  },
};
