import { detectorMock, notificationsStart } from '../../../Interfaces.mock';

export default {
  detector: detectorMock,
  editAlertTriggers: jest.fn(),
  notifications: notificationsStart,
};
