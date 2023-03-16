/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useMemo, useEffect, useState, useContext } from 'react';
import { EuiButton } from '@elastic/eui';
import { AlertTriggerView } from '../../components/AlertTriggerView/AlertTriggerView';
import { Detector } from '../../../../../models/interfaces';
import { ServicesContext } from '../../../../services';
import { ServerResponse } from '../../../../../server/models/types';
import {
  FeatureChannelList,
  GetChannelsResponse,
  RuleInfo,
} from '../../../../../server/models/interfaces';
import { errorNotificationToast } from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DataStore } from '../../../../store/DataStore';

export interface AlertTriggersViewProps {
  detector: Detector;
  editAlertTriggers: () => void;
  notifications: NotificationsStart;
  isEditable: boolean;
}

export const AlertTriggersView: React.FC<AlertTriggersViewProps> = ({
  detector,
  editAlertTriggers,
  notifications,
  isEditable = true,
}) => {
  const services = useContext(ServicesContext);
  const [channels, setChannels] = useState<FeatureChannelList[]>([]);
  const [rules, setRules] = useState<{ [key: string]: RuleInfo }>({});
  const actions = useMemo(
    () => (isEditable ? [<EuiButton onClick={editAlertTriggers}>Edit</EuiButton>] : null),
    []
  );

  useEffect(() => {
    const getNotificationChannels = async () => {
      const response = (await services?.notificationsService.getChannels()) as ServerResponse<
        GetChannelsResponse
      >;
      if (response.ok) {
        setChannels(response.response.channel_list);
      } else {
        errorNotificationToast(notifications, 'retrieve', 'notification channels', response.error);
      }
    };

    const getRules = async () => {
      const parseRules: { [key: string]: RuleInfo } = {};

      // Retrieve the custom rules.
      const customRuleIds = detector.inputs[0].detector_input.custom_rules.map((rule) => rule.id);
      if (customRuleIds.length > 0) {
        const customRules = await DataStore.rules.getCustomRules({ _id: customRuleIds });

        customRules.forEach((rule) => (parseRules[rule._id] = rule));
      }

      // Retrieve the prepackaged rules.
      const prepackagedRuleIds = detector.inputs[0].detector_input.pre_packaged_rules.map(
        (rule) => rule.id
      );
      if (prepackagedRuleIds.length > 0) {
        const prePackagedRules = await DataStore.rules.getPrePackagedRules({
          _id: prepackagedRuleIds,
        });

        prePackagedRules.forEach((rule) => (parseRules[rule._id] = rule));
      }

      // Set all enabled rules.
      setRules({ ...parseRules });
    };

    const getChannelsAndRules = async () => {
      await getNotificationChannels();
      await getRules();
    };

    getChannelsAndRules().catch((e) => {
      console.error('Failed to retrieve rules and notification channels:', e);
      errorNotificationToast(notifications, 'retrieve', 'notification channels and rules', e);
    });
  }, [services, detector]);

  return (
    <ContentPanel title={`Alert triggers (${detector.triggers.length})`} actions={actions}>
      {detector.triggers.map((alertTrigger, index) => (
        <AlertTriggerView
          key={alertTrigger.id}
          alertTrigger={alertTrigger}
          orderPosition={index}
          detector={detector}
          notificationChannels={channels}
          rules={rules}
        />
      ))}
    </ContentPanel>
  );
};
