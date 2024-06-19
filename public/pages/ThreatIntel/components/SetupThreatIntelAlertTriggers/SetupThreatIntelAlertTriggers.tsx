/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationChannelTypeOptions, ThreatIntelAlertTrigger } from '../../../../../types';
import React, { useCallback, useEffect, useState } from 'react';
import { ThreatIntelAlertTriggerForm } from '../ThreatIntelAlertTriggerForm/ThreatIntelAlertTriggerForm';
import {
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { NotificationsService } from '../../../../services';
import { EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';

export interface SetupThreatIntelAlertTriggersProps {
  alertTriggers: ThreatIntelAlertTrigger[];
  notificationsService: NotificationsService;
  updateTriggers: (alertTriggers: ThreatIntelAlertTrigger[]) => void;
}

export const SetupThreatIntelAlertTriggers: React.FC<SetupThreatIntelAlertTriggersProps> = ({
  alertTriggers,
  notificationsService,
  updateTriggers,
}) => {
  const [loadingNotificationChannels, setLoadingNotificationChannels] = useState(false);
  const [notificationChannels, setNotificationChannels] = useState<
    NotificationChannelTypeOptions[]
  >([]);

  const updateNotificationChannels = useCallback(async () => {
    setLoadingNotificationChannels(true);
    const channels = await getNotificationChannels(notificationsService);
    const parsedChannels = parseNotificationChannelsToOptions(channels);
    setNotificationChannels(parsedChannels);
    setLoadingNotificationChannels(false);
  }, [notificationsService]);

  useEffect(() => {
    updateNotificationChannels();
  }, [notificationsService]);

  const onDeleteTrigger = (triggerIdx: number) => {
    const newTriggers = [...alertTriggers].splice(triggerIdx, 1);
    updateTriggers(newTriggers);
  };

  const onTriggerUpdate = (trigger: ThreatIntelAlertTrigger, triggerIdx: number) => {
    const newTriggers = [
      ...alertTriggers.slice(0, triggerIdx),
      trigger,
      ...alertTriggers.slice(triggerIdx + 1),
    ];

    updateTriggers(newTriggers);
  };

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h2>Set up alert triggers</h2>
      </EuiTitle>
      <EuiSpacer />
      {alertTriggers.map((trigger, idx) => {
        return (
          <ThreatIntelAlertTriggerForm
            allNotificationChannels={notificationChannels}
            loadingNotifications={loadingNotificationChannels}
            onDeleteTrgger={() => onDeleteTrigger(idx)}
            refreshNotificationChannels={updateNotificationChannels}
            trigger={trigger}
            updateTrigger={(trigger) => onTriggerUpdate(trigger, idx)}
          />
        );
      })}
    </EuiPanel>
  );
};
