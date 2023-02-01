import { mockDetector } from '../../containers/Detectors/Detectors.mock';

export default {
  detector: mockDetector,
  rulesCanFold: true,
  enabled_time: 1,
  last_update_time: 1,
  onEditClicked: () => jest.fn(),
};
