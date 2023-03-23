/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorMock from '../../containers/Detectors/Detector.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import { DetectorRulesViewProps } from '../../../../../public/pages/Detectors/components/DetectorRulesView/DetectorRulesView';

export default ({
  detector: detectorMock,
  rulesCanFold: false,
  onEditClicked: jest.fn(),
  notifications: notificationsStartMock,
  isEditable: true,
} as unknown) as DetectorRulesViewProps;
