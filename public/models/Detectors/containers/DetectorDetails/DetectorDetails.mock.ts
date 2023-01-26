import {
  mockDetectorHit,
  mockDetectorService,
  mockHistory,
  mockNotificationsStart,
} from '../../../Interfaces.mock';

export default {
  detectorHit: mockDetectorHit,
  detectorService: mockDetectorService,
  notifications: mockNotificationsStart,
  location: {
    pathname: '/detector-details/detectorHitId',
  },
  history: mockHistory,
};
