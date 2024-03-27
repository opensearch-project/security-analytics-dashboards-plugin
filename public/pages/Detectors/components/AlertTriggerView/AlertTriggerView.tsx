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
import { RuleInfo } from '../../../../../server/models/interfaces';
import { Detector, FeatureChannelList } from '../../../../../types';

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
  const { name, sev_levels, tags, ids, severity, actions, detection_types } = alertTrigger;
  const alertSeverity = parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA;
  const action = actions[0];
  const notificationChannelId = detector.triggers[orderPosition]?.actions[0]?.destination_id;
  const notificationChannel = notificationChannels.find(
    (channel) => !!notificationChannelId && channel.config_id === notificationChannelId
  );
  const conditionRuleNames = ids.map((ruleId) => rules[ruleId]?._source.title);
  const ruleDetectionTypeEnabled = detection_types.includes('rules');
  const threatIntelDetectionTypeEnabled = detection_types.includes('threat_intel');
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
        <EuiSpacer size="s" />
        {createTextDetailsGroup([{ label: 'Trigger name', content: `${name}` }])}

        <EuiTitle size="s">
          <h4>Trigger condition </h4>
        </EuiTitle>

        {ruleDetectionTypeEnabled && (
          <>
            <EuiTitle size="xs">
              <h5>For detection rules</h5>
            </EuiTitle>
            <EuiSpacer size={'s'} />
            {createTextDetailsGroup([
              { label: 'Rule names', content: conditionRuleNames.join('\n') || 'Any rule' },
            ])}
            {createTextDetailsGroup([
              { label: 'Rule severities', content: sev_levels.join('\n') || 'Any severity' },
              { label: 'Tags', content: tags.join('\n') || 'Any tag' },
            ])}
          </>
        )}

        {threatIntelDetectionTypeEnabled && (
          <>
            <EuiTitle size="xs">
              <h5>For threat intelligence </h5>
            </EuiTitle>
            <EuiSpacer size={'s'} />
            {createTextDetailsGroup([
              { label: 'IOC match', content: 'Any match in threat intelligence feed' },
            ])}
          </>
        )}

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
