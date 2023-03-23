/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorMock from '../../containers/Detectors/Detector.mock';
import { DetectorBasicDetailsView } from '../../../../../public/pages/Detectors/components/DetectorBasicDetailsView/DetectorBasicDetailsView';

export default ({
  detector: detectorMock,
  rulesCanFold: true,
  enabled_time: 1,
  last_update_time: 1,
  onEditClicked: () => jest.fn(),
  isEditable: true,
} as unknown) as typeof DetectorBasicDetailsView;
