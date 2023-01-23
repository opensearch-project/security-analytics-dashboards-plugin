import { detectorMock } from '../../InterfacesMock.test';

const notificationsStart: NotificationsStart = {};
export default {
  detector: detectorMock,
  rulesCanFold: true,
  onEditClicked: jest.fn(),
  notifications: notificationsStart,
};
