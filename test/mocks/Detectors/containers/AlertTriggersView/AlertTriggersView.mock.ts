/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriggersViewProps } from '../../../../../public/pages/Detectors/containers/AlertTriggersView/AlertTriggersView';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorMock from '../Detectors/Detector.mock';

export const alertTriggerViewProps: AlertTriggersViewProps = {
  detector: detectorMock,
  editAlertTriggers: jest.fn(),
  notifications: notificationsStartMock,
};
