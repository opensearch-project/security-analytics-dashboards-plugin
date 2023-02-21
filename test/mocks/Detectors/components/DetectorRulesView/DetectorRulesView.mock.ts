/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorMock from '../../containers/Detectors/Detector.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import { DetectorRulesView } from '../../../../../public/pages/Detectors/components/DetectorRulesView/DetectorRulesView';

export default ({
  detector: detectorMock,
  rulesCanFold: false,
  onEditClicked: jest.fn(),
  notifications: notificationsStartMock,
} as unknown) as typeof DetectorRulesView;
