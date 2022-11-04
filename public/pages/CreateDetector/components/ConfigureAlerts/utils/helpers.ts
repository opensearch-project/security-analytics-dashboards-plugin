/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { ALERT_SEVERITY_OPTIONS, CHANNEL_TYPES } from './constants';
import { FeatureChannelList } from '../../../../../../server/models/interfaces/Notifications';
import { NotificationChannelTypeOptions } from '../models/interfaces';
import { NotificationsService } from '../../../../../services';

export const parseAlertSeverityToOption = (severity: string): EuiComboBoxOptionOption<string> => {
  return Object.values(ALERT_SEVERITY_OPTIONS).find(
    (option) => option.value === severity
  ) as EuiComboBoxOptionOption<string>;
};

export function createSelectedOptions(optionNames: string[]): EuiComboBoxOptionOption<string>[] {
  return optionNames.map((optionName) => ({ id: optionName, label: optionName }));
}

export const getNotificationChannels = async (notificationsService: NotificationsService) => {
  try {
    const response = await notificationsService.getChannels();
    if (response.ok) {
      return response.response.channel_list;
    } else {
      console.error('Failed to retrieve notification channels:', response.error);
    }
  } catch (e) {
    console.error('Failed to retrieve notification channels:', e);
  }
  return [];
};

export function parseNotificationChannelsToOptions(
  notificationChannels: FeatureChannelList[],
  supportedTypes = CHANNEL_TYPES
): NotificationChannelTypeOptions[] {
  const allOptions = notificationChannels.map((channel) => ({
    label: `[Channel] ${channel.name}`,
    value: channel.config_id,
    type: channel.config_type,
    description: channel.description,
  }));
  return supportedTypes.map((type) => ({
    label: type,
    options: allOptions.filter((channel) => channel.type === type),
  }));
}
