import { mockDetector } from '../../containers/Detectors/Detectors.mock';
import { mockNotificationsStart } from '../../../browserServicesMock';

export default {
  detector: mockDetector,
  rulesCanFold: false,
  onEditClicked: jest.fn(),
  notifications: mockNotificationsStart,
};
