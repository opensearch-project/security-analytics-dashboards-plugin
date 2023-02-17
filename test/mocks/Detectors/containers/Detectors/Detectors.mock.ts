/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorServiceMock from '../../../services/detectorService.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import { DetectorsProps } from '../../../../../public/pages/Detectors/containers/Detectors/Detectors';

export default ({
  detectorService: detectorServiceMock,
  notifications: notificationsStartMock,
} as unknown) as DetectorsProps;
