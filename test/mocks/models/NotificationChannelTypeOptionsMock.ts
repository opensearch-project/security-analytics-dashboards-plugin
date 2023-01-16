/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  NotificationChannelOption,
} from "../../../public/pages/CreateDetector/components/ConfigureAlerts/models/interfaces";
import { modelsMock } from '../';

const { notificationChannelOptionMock } = modelsMock;
const notificationChannelOption: NotificationChannelOption = notificationChannelOptionMock;

export default {
  label: 'some label',
  options: [notificationChannelOption],
}
