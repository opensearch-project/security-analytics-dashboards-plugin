/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { ThreatIntelAlertTrigger } from '../../../../../types';
import React, { useCallback } from 'react';
import { IocLabel } from '../../../../../common/constants';
import {
  DescriptionGroup,
  DescriptionGroupProps,
} from '../../../../components/Utility/DescriptionGroup';
import { getThreatIntelALertSeverityLabel } from '../../utils/helpers';
import { AlertSeverity } from '../../../Alerts/utils/constants';
import { ConfigActionButton } from '../Utility/ConfigActionButton';

export interface ThreatIntelAlertTriggersProps {
  triggers: ThreatIntelAlertTrigger[];
  threatIntelSourceCount: number;
  scanConfigActionHandler: () => void;
}

export const ThreatIntelAlertTriggers: React.FC<ThreatIntelAlertTriggersProps> = ({
  triggers,
  threatIntelSourceCount,
  scanConfigActionHandler,
}) => {
  const getTriggerConditionDetails = (
    triggerCondtion: ThreatIntelAlertTrigger['triggerCondition']
  ): DescriptionGroupProps['listItems'] => {
    return [
      {
        title: 'Indicator type',
        description: triggerCondtion.indicatorType.join(', ') || 'Any',
      },
      {
        title: 'Log source',
        description: triggerCondtion.dataSource.join(', ') || 'Any',
      },
    ];
  };

  const getNotificationConfig = (
    alertSeverity: AlertSeverity,
    triggerAction: ThreatIntelAlertTrigger['action']
  ): DescriptionGroupProps['listItems'] => {
    return [
      {
        title: 'Severity',
        description: getThreatIntelALertSeverityLabel(alertSeverity),
      },
      {
        title: 'Notification channel',
        description: triggerAction.destination_name,
      },
    ];
  };

  const createTitle = useCallback((text: string) => {
    return (
      <>
        <EuiTitle size="m">
          <h4>{text}</h4>
        </EuiTitle>
        <EuiSpacer />
      </>
    );
  }, []);

  return (
    <EuiPanel>
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle>
            <h4>Log sources</h4>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ConfigActionButton
            action={threatIntelSourceCount > 0 && triggers.length ? 'edit' : 'configure'}
            actionHandler={scanConfigActionHandler}
            disabled={threatIntelSourceCount === 0}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      {triggers.map(({ action, alertSeverity, name, triggerCondition }, idx) => {
        const logSourcesCount =
          triggerCondition.dataSource.length === 0
            ? 'Any'
            : triggerCondition.dataSource.length.toString();
        const iocTriggerCondition =
          triggerCondition.indicatorType.length === 0
            ? 'All types of indicators'
            : triggerCondition.indicatorType.map((iocType) => IocLabel[iocType]).join(', ');

        return (
          <EuiAccordion
            id={`threat-intel-alert-trigger-${idx}`}
            key={idx}
            initialIsOpen={false}
            buttonContent={
              <>
                <EuiTitle size="s">
                  <h4>{name}</h4>
                </EuiTitle>
                <EuiText
                  color="subdued"
                  size="s"
                >{`${logSourcesCount} log sources, ${iocTriggerCondition}`}</EuiText>
              </>
            }
            paddingSize="m"
          >
            <DescriptionGroup
              listItems={[
                {
                  title: createTitle('Trigger condition'),
                  description: (
                    <DescriptionGroup
                      listItems={getTriggerConditionDetails(triggerCondition)}
                      groupProps={{ justifyContent: 'spaceAround' }}
                    />
                  ),
                },
                {
                  title: createTitle('Notification'),
                  description: (
                    <DescriptionGroup
                      listItems={getNotificationConfig(alertSeverity, action)}
                      groupProps={{ justifyContent: 'spaceAround' }}
                    />
                  ),
                },
              ]}
            />
          </EuiAccordion>
        );
      })}
    </EuiPanel>
  );
};
