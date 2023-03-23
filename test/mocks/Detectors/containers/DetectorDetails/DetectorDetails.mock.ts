/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorHitMock from '../Detectors/DetectorHit.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';
import savedObjectsServiceMock from '../../../services/savedObjectService.mock';
import { DetectorDetailsProps } from '../../../../../public/pages/Detectors/containers/Detector/DetectorDetails';
import { detectorServiceMock } from '../../../services/detectorService.mock';

export default ({
  detectorHit: detectorHitMock,
  detectorService: detectorServiceMock,
  notifications: notificationsStartMock,
  location: {
    pathname: '/detector-details/detector_id_1',
  },
  history: browserHistoryMock,
  savedObjectsService: savedObjectsServiceMock,
} as unknown) as DetectorDetailsProps;
