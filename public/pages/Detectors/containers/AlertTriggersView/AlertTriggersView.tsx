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
  GetRulesResponse,
  RuleInfo,
} from '../../../../../server/models/interfaces';
import { errorNotificationToast } from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';

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
  isEditable,
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

      // Retrieve the prepackaged rules.
      const prepackagedRuleIds = detector.inputs[0].detector_input.pre_packaged_rules.map(
        (rule) => rule.id
      );
      if (prepackagedRuleIds.length > 0) {
        const prePackagedResponse = (await services?.ruleService.getRules(true, {
          from: 0,
          size: 5000,
          query: { nested: { path: 'rule', query: { terms: { _id: prepackagedRuleIds } } } },
        })) as ServerResponse<GetRulesResponse>;

        if (prePackagedResponse.ok) {
          prePackagedResponse.response.hits.hits.forEach((rule) => (parseRules[rule._id] = rule));
        } else {
          errorNotificationToast(
            notifications,
            'retrieve',
            'pre-packaged rules',
            prePackagedResponse.error
          );
        }
      }

      // Retrieve the custom rules.
      const customRuleIds = detector.inputs[0].detector_input.custom_rules.map((rule) => rule.id);
      if (customRuleIds.length > 0) {
        const customResponse = (await services?.ruleService.getRules(true, {
          from: 0,
          size: 5000,
          query: { nested: { path: 'rule', query: { terms: { _id: customRuleIds } } } },
        })) as ServerResponse<GetRulesResponse>;

        if (customResponse.ok) {
          customResponse.response.hits.hits.forEach((rule) => (parseRules[rule._id] = rule));
        } else {
          errorNotificationToast(notifications, 'retrieve', 'custom rules', customResponse.error);
        }
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
