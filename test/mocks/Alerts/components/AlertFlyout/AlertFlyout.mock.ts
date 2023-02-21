/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import services from '../../../services';
import alertItemMock from '../../AlertItem.mock';
import detectorMock from '../../../Detectors/containers/Detectors/Detector.mock';
import { AlertFlyout } from '../../../../../public/pages/Alerts/components/AlertFlyout/AlertFlyout';
const { openSearchService, findingsService, ruleService } = services;

export default ({
  alertItem: alertItemMock,
  detector: detectorMock,
  findingsService,
  ruleService,
  notifications: notificationsStartMock,
  opensearchService: openSearchService,
  onClose: jest.fn(),
  onAcknowledge: jest.fn(),
} as unknown) as AlertFlyout;
