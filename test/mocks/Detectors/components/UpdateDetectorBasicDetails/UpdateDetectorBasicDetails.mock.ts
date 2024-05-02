/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import browserHistoryMock from '../../../services/browserHistory.mock';
import { UpdateDetectorBasicDetailsProps } from '../../../../../public/pages/Detectors/components/UpdateBasicDetails/UpdateBasicDetails';

export default {
  notifications: notificationsStartMock,
  detectorHit: detectorHitMock,
  location: {
    pathname: '/edit-detector-details/detector_id_1',
    search: '',
    state: { detectorHit: detectorHitMock },
    hash: '',
  },
  history: browserHistoryMock,
  match: {
    isExact: false,
    path: '',
    url: '',
    params: { id: '1' },
  },
} as UpdateDetectorBasicDetailsProps;
