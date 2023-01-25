import { detectorMock, notificationsStart } from '../../../Interfaces.mock';

export default {
  detector: detectorMock,
  rulesCanFold: true,
  onEditClicked: jest.fn(),
  notifications: notificationsStart,
};
