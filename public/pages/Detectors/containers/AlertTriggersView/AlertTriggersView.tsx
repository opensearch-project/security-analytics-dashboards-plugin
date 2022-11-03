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

export interface AlertTriggersViewProps {
  detector: Detector;
  editAlertTriggers: () => void;
}

export const AlertTriggersView: React.FC<AlertTriggersViewProps> = ({
  detector,
  editAlertTriggers,
}) => {
  const services = useContext(ServicesContext);
  const [channels, setChannels] = useState<FeatureChannelList[]>([]);
  const [rules, setRules] = useState<{ [key: string]: RuleInfo }>({});
  const actions = useMemo(() => [<EuiButton onClick={editAlertTriggers}>Edit</EuiButton>], []);

  useEffect(() => {
    const getNotificationChannels = async () => {
      try {
        const response = (await services?.notificationsService.getChannels()) as ServerResponse<
          GetChannelsResponse
        >;
        if (response.ok) {
          setChannels(response.response.channel_list);
        } else {
          console.error('Failed to retrieve notification channels:', response.error);
          // TODO implement toast
        }
      } catch (e) {
        console.error('Failed to retrieve notification channels:', e);
        // TODO implement toast
      }
    };

    const getRules = async () => {
      try {
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
            console.error('Failed to retrieve prepackaged rules:', prePackagedResponse.error);
            // TODO implement toast
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
            console.error('Failed to retrieve custom rules:', customResponse.error);
            // TODO implement toast
          }
        }

        // Set all enabled rules.
        setRules({ ...parseRules });
      } catch (e) {
        console.error('Failed to retrieve rules:', e);
        // TODO implement toast
      }
    };

    const getChannelsAndRules = async () => {
      await getNotificationChannels();
      await getRules();
    };

    getChannelsAndRules().catch((e) => {
      console.error('Failed to retrieve rules and notification channels:', e);
      // TODO implement toast
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
