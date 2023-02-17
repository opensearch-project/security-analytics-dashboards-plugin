/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import notificationChannelOptionMock from './NotificationChannelOption.mock';
import { NotificationChannelTypeOptions } from '../../../../public/pages/CreateDetector/components/ConfigureAlerts/models/interfaces';

export default {
  label: 'some_label',
  options: [notificationChannelOptionMock],
} as NotificationChannelTypeOptions;
