import { detectorMock, notificationsStart } from '../../../Interfaces.mock';

export default {
  detector: detectorMock,
  rulesCanFold: false,
  onEditClicked: jest.fn(),
  notifications: notificationsStart,
};
