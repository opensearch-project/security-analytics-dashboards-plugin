import { mockDetector, mockNotificationsStart } from '../../../Interfaces.mock';

export default {
  detector: mockDetector,
  editAlertTriggers: jest.fn(),
  notifications: mockNotificationsStart,
};
