/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import services from '../../../services';
import notifications from '../../../services/notifications';
const { NotificationsStart } = notifications;
const { detectorService } = services;

export default {
  detectorService: detectorService,
  notifications: NotificationsStart,
};
