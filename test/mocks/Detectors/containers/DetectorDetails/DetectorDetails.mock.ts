/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorHitMock from '../Detectors/DetectorHit.mock';
import services from '../../../services';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';
import { DetectorDetails } from '../../../../../public/pages/Detectors/containers/Detector/DetectorDetails';

const { detectorService } = services;

export default ({
  detectorHit: detectorHitMock,
  detectorService: detectorService,
  notifications: notificationsStartMock,
  location: {
    pathname: '/detector-details/detector_id_1',
  },
  history: browserHistoryMock,
} as unknown) as typeof DetectorDetails;
