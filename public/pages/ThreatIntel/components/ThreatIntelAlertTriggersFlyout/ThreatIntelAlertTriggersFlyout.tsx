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
import { ThreatIntelAlertTrigger, ThreatIntelAlertTriggerAction } from '../../../../../types';
import React, { useCallback } from 'react';
import {
  DescriptionGroup,
  DescriptionGroupProps,
} from '../../../../components/Utility/DescriptionGroup';
import { getThreatIntelALertSeverityLabel } from '../../utils/helpers';
import { AlertSeverity } from '../../../Alerts/utils/constants';
import { ConfigActionButton } from '../Utility/ConfigActionButton';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { renderIoCType } from '../../../../utils/helpers';

export interface ThreatIntelAlertTriggersProps {
  triggers: ThreatIntelAlertTrigger[];
  threatIntelSourceCount: number;
  scanConfigActionHandler: () => void;
}

export const ThreatIntelAlertTriggersFlyout: React.FC<ThreatIntelAlertTriggersProps> = ({
  triggers,
  threatIntelSourceCount,
  scanConfigActionHandler,
}) => {
  const getTriggerConditionDetails = (
    dataSources: string[],
    indicatorTypes: string[]
  ): DescriptionGroupProps['listItems'] => {
    return [
      {
        title: 'Indicator type',
        description: indicatorTypes.join(', ') || 'Any',
      },
      {
        title: 'Log source',
        description: dataSources.join(', ') || 'Any',
      },
    ];
  };

  const getNotificationConfig = (
    alertSeverity: AlertSeverity,
    triggerAction: ThreatIntelAlertTriggerAction
  ): DescriptionGroupProps['listItems'] => {
    return [
      {
        title: 'Severity',
        description: getThreatIntelALertSeverityLabel(alertSeverity),
      },
      {
        title: 'Notification channel',
        description: DEFAULT_EMPTY_DATA,
      },
    ];
  };

  const createTitle = useCallback((text: string) => {
    return (
      <>
        <EuiTitle size="s">
          <h4>{text}</h4>
        </EuiTitle>
        <EuiSpacer />
      </>
    );
  }, []);

  return (
    <EuiPanel hasBorder={false} hasShadow={false}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiTitle>
            <h4>Alert triggers ({triggers.length})</h4>
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
      {triggers.map(({ actions, severity, name, data_sources, ioc_types }, idx) => {
        const logSourcesCount = data_sources.length === 0 ? 'Any' : data_sources.length.toString();
        const iocTriggerCondition =
          ioc_types.length === 0
            ? 'All types of indicators'
            : ioc_types.map((iocType) => renderIoCType(iocType)).join(', ');

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
                      listItems={getTriggerConditionDetails(data_sources, ioc_types)}
                      groupProps={{ justifyContent: 'spaceAround' }}
                    />
                  ),
                },
              ]}
            />
            <EuiSpacer />
            <DescriptionGroup
              listItems={[
                {
                  title: createTitle('Notification'),
                  description: (
                    <DescriptionGroup
                      listItems={getNotificationConfig(severity, actions[0])}
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
