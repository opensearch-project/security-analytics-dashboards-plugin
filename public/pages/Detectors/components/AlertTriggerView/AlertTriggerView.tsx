/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiAccordion, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { AlertCondition } from '../../../../../models/interfaces';
import React from 'react';
import { createTextDetailsGroup } from '../../../../utils/helpers';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';

export interface AlertTriggerViewProps {
  alertTrigger: AlertCondition;
  orderPosition: number;
}

export const AlertTriggerView: React.FC<AlertTriggerViewProps> = ({
  alertTrigger,
  orderPosition,
}) => {
  const { name, sev_levels, types, tags, ids, severity } = alertTrigger;
  const alertSeverity = parseAlertSeverityToOption(severity).label;

  return (
    <EuiAccordion
      id={`alert-trigger-${orderPosition}`}
      paddingSize={'none'}
      initialIsOpen={false}
      buttonContent={
        <EuiText size="m">
          <p>{`Alert on ${name}`}</p>
        </EuiText>
      }
    >
      <EuiSpacer size="xxl" />
      {createTextDetailsGroup([{ label: 'Trigger name', content: `${name}` }])}
      <EuiSpacer size="xl" />

      <EuiTitle size="s">
        <h5>If any detection rule matches</h5>
      </EuiTitle>
      {createTextDetailsGroup([
        { label: 'Log types', content: `${types[0]}` },
        { label: 'Rule names', content: `${ids.join(',')}` },
      ])}
      {createTextDetailsGroup([
        { label: 'Rule severities', content: `${sev_levels.join(',')}` },
        { label: 'Tags', content: `${tags.join(',')}` },
      ])}
      <EuiSpacer size="xl" />

      <EuiTitle size="s">
        <h5>Alert and notify</h5>
      </EuiTitle>
      <EuiSpacer size="xl" />
      {createTextDetailsGroup([
        { label: 'Trigger alerts with severity', content: `${alertSeverity}` },
      ])}
      {createTextDetailsGroup([{ label: 'Notify channels', content: `${'Email'}` }])}
      <EuiSpacer size="xxl" />
    </EuiAccordion>
  );
};
