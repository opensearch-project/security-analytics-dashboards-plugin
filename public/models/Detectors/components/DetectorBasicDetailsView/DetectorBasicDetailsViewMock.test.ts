import { detectorMock } from '../../InterfacesMock.test';

export default {
  detector: detectorMock,
  rulesCanFold: true,
  enabled_time: 1,
  last_update_time: 1,
  onEditClicked: () => jest.fn(),
};
