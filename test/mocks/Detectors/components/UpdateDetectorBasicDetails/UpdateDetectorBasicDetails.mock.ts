/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';

export default {
  notifications: notificationsStartMock,
  detectorHit: detectorHitMock,
  location: {
    pathname: '/edit-detector-details/detector_id_1',
  },
  history: browserHistoryMock,
};
