/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import detectorHitMock from '../../containers/Detectors/DetectorHit.mock';
import { UpdateDetectorRules } from '../../../../../public/pages/Detectors/components/UpdateRules/UpdateRules';

export default ({
  notifications: notificationsStartMock,
  detectorHit: detectorHitMock,
  location: {
    pathname: '',
  },
} as unknown) as typeof UpdateDetectorRules;
