/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorMock from '../Detectors/Detector.mock';
import { AlertTriggerView } from '../../../../../public/pages/Detectors/components/AlertTriggerView/AlertTriggerView';

export default ({
  detector: detectorMock,
  editAlertTriggers: jest.fn(),
  notifications: notificationsStartMock,
} as unknown) as typeof AlertTriggerView;
