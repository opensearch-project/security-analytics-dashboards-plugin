/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiHorizontalRule,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { AlertCondition } from '../../../../../models/interfaces';
import React from 'react';
import { createTextDetailsGroup } from '../../../../utils/helpers';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { DEFAULT_EMPTY_DATA, getNotificationDetailsHref } from '../../../../utils/constants';
import { FeatureChannelList, RuleInfo } from '../../../../../server/models/interfaces';
import { Detector } from '../../../../../types';

export interface AlertTriggerViewProps {
  alertTrigger: AlertCondition;
  orderPosition: number;
  detector: Detector;
  notificationChannels: FeatureChannelList[];
  rules: { [key: string]: RuleInfo };
}

export const AlertTriggerView: React.FC<AlertTriggerViewProps> = ({
  alertTrigger,
  orderPosition,
  detector,
  notificationChannels,
  rules,
}) => {
  const { name, sev_levels, types, tags, ids, severity, actions } = alertTrigger;
  const alertSeverity = parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA;
  const action = actions[0];
  const notificationChannelId = detector.triggers[orderPosition]?.actions[0]?.destination_id;
  const notificationChannel = notificationChannels.find(
    (channel) => !!notificationChannelId && channel.config_id === notificationChannelId
  );
  const conditionRuleNames = ids.map((ruleId) => rules[ruleId]?._source.title);
  return (
    <div>
      {orderPosition > 0 && <EuiHorizontalRule margin={'m'} />}
      {orderPosition === 0 && <EuiSpacer size={'s'} />}
      <EuiAccordion
        id={`alert-trigger-${orderPosition}`}
        paddingSize={'m'}
        initialIsOpen={false}
        buttonContent={
          <EuiText size="m">
            <p>{name}</p>
          </EuiText>
        }
      >
        <EuiSpacer size="m" />
        {createTextDetailsGroup([{ label: 'Trigger name', content: `${name}` }])}
        <EuiSpacer size="xl" />

        <EuiTitle size="s">
          <h5>If any detection rule matches</h5>
        </EuiTitle>
        <EuiSpacer size={'m'} />
        {createTextDetailsGroup([
          { label: 'Log type', content: `${types[0]}` || DEFAULT_EMPTY_DATA },
          { label: 'Rule names', content: conditionRuleNames.join('\n') || DEFAULT_EMPTY_DATA },
        ])}
        {createTextDetailsGroup([
          { label: 'Rule severities', content: sev_levels.join('\n') || DEFAULT_EMPTY_DATA },
          { label: 'Tags', content: tags.join('\n') || DEFAULT_EMPTY_DATA },
        ])}
        <EuiSpacer size="xl" />

        <EuiTitle size="s">
          <h5>Alert and notify</h5>
        </EuiTitle>
        <EuiSpacer size="m" />
        {createTextDetailsGroup([
          {
            label: 'Trigger alerts with severity',
            content: `${alertSeverity}` || DEFAULT_EMPTY_DATA,
          },
        ])}
        <EuiSpacer size="l" />
        {createTextDetailsGroup([
          {
            label: 'Notify channel',
            content: notificationChannel ? (
              <EuiLink href={getNotificationDetailsHref(action.destination_id)} target={'_blank'}>
                {notificationChannel.name}
              </EuiLink>
            ) : (
              <EuiText>{DEFAULT_EMPTY_DATA}</EuiText>
            ),
          },
        ])}
      </EuiAccordion>
    </div>
  );
};
