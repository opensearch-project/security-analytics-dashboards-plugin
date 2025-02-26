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
import { EuiSmallButton, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import { getEmptyThreatIntelAlertTrigger } from '../../utils/helpers';

export interface ConfigureThreatIntelAlertTriggersProps {
  alertTriggers: ThreatIntelAlertTrigger[];
  notificationsService: NotificationsService;
  enabledIocTypes: string[];
  logSources: string[];
  getNextTriggerName: () => string;
  updateTriggers: (alertTriggers: ThreatIntelAlertTrigger[]) => void;
}

export const ConfigureThreatIntelAlertTriggers: React.FC<ConfigureThreatIntelAlertTriggersProps> = ({
  alertTriggers,
  enabledIocTypes,
  logSources,
  notificationsService,
  getNextTriggerName,
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
    const newTriggers = [...alertTriggers];
    newTriggers.splice(triggerIdx, 1);
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
            enabledIocTypes={enabledIocTypes}
            logSources={logSources}
            onDeleteTrgger={() => onDeleteTrigger(idx)}
            refreshNotificationChannels={updateNotificationChannels}
            trigger={trigger}
            updateTrigger={(trigger) => onTriggerUpdate(trigger, idx)}
          />
        );
      })}
      <EuiSpacer />
      <EuiSmallButton
        onClick={() => {
          updateTriggers([
            ...alertTriggers,
            getEmptyThreatIntelAlertTrigger(getNextTriggerName(), false),
          ]);
        }}
      >
        Add another alert trigger
      </EuiSmallButton>
    </EuiPanel>
  );
};
