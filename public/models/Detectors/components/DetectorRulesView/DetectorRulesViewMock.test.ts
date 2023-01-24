import { detectorMock } from '../../InterfacesMock.test';

const notificationsStart = {
  toasts: [],
};
export default {
  detector: detectorMock,
  rulesCanFold: true,
  onEditClicked: jest.fn(),
  notifications: notificationsStart,
};
