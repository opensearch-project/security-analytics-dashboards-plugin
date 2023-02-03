/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationChannelOption } from '../../../../public/pages/CreateDetector/components/ConfigureAlerts/models/interfaces';
import notificationChannelOptionMock from './NotificationChannelOption.mock';

const notificationChannelOption: NotificationChannelOption = notificationChannelOptionMock;

export default {
  label: 'some_label',
  options: [notificationChannelOption],
};
