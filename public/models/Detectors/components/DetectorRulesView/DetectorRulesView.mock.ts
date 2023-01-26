import { mockDetector, mockNotificationsStart } from '../../../Interfaces.mock';

export default {
  detector: mockDetector,
  rulesCanFold: false,
  onEditClicked: jest.fn(),
  notifications: mockNotificationsStart,
};
