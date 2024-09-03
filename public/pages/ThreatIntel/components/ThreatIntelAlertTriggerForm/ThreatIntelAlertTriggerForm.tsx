/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiSmallButtonIcon,
  EuiCompressedComboBox,
  EuiComboBoxOptionOption,
  EuiCompressedFieldText,
  EuiCompressedFormRow,
  EuiSpacer,
} from '@elastic/eui';
import { NotificationChannelTypeOptions, ThreatIntelAlertTrigger } from '../../../../../types';
import React from 'react';
import { NotificationForm } from '../../../../components/Notifications/NotificationForm';
import { ThreatIntelIocType } from '../../../../../common/constants';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { AlertSeverity } from '../../../Alerts/utils/constants';
import { getEmptyThreatIntelAlertTriggerAction } from '../../utils/helpers';
import { ALERT_SEVERITY_OPTIONS } from '../../../../utils/constants';

export interface ThreatIntelAlertTriggerProps {
  allNotificationChannels: NotificationChannelTypeOptions[];
  loadingNotifications: boolean;
  trigger: ThreatIntelAlertTrigger;
  enabledIocTypes: ThreatIntelIocType[];
  logSources: string[];
  onDeleteTrgger: () => void;
  refreshNotificationChannels: () => void;
  updateTrigger: (trigger: ThreatIntelAlertTrigger) => void;
}

export const ThreatIntelAlertTriggerForm: React.FC<ThreatIntelAlertTriggerProps> = ({
  allNotificationChannels,
  loadingNotifications,
  trigger,
  enabledIocTypes,
  logSources,
  onDeleteTrgger,
  refreshNotificationChannels,
  updateTrigger,
}) => {
  const onChannelsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    updateTrigger({
      ...trigger,
      actions: [
        {
          ...trigger.actions[0],
          destination_id: selectedOptions[0]?.value || '',
        },
      ],
    });
  };

  const onNotificationToggle = (enabled: boolean) => {
    updateTrigger({
      ...trigger,
      actions: enabled ? [getEmptyThreatIntelAlertTriggerAction()] : [],
    });
  };

  const onMessageSubjectChange = (subject: string) => {
    updateTrigger({
      ...trigger,
      actions: [
        {
          ...trigger.actions[0],
          name: subject,
          subject_template: {
            ...trigger.actions[0].subject_template,
            source: subject,
          },
        },
      ],
    });
  };

  const onMessageBodyChange = (message: string) => {
    updateTrigger({
      ...trigger,
      actions: [
        {
          ...trigger.actions[0],
          message_template: {
            ...trigger.actions[0].message_template,
            source: message,
          },
        },
      ],
    });
  };

  return (
    <EuiAccordion
      id="threat-intel-trigger"
      initialIsOpen={true}
      buttonContent={trigger.name}
      extraAction={<EuiSmallButtonIcon iconType={'trash'} onClick={onDeleteTrgger} />}
      paddingSize="l"
    >
      <EuiCompressedFormRow>
        <EuiCompressedFieldText
          placeholder="Trigger name"
          value={trigger.name}
          onChange={(event) => {
            updateTrigger({
              ...trigger,
              name: event.target.value,
            });
          }}
        />
      </EuiCompressedFormRow>
      <EuiSpacer />
      <EuiAccordion
        id={'threat-intel-trigger-condition'}
        buttonContent="Trigger condition"
        initialIsOpen={true}
        paddingSize="l"
      >
        <EuiCompressedFormRow label="Indicator type(s)">
          <EuiCompressedComboBox
            placeholder="Any"
            options={enabledIocTypes.map((ioc) => ({ label: ioc }))}
            selectedOptions={trigger.ioc_types.map((iocType) => ({ label: iocType }))}
            onChange={(options) => {
              updateTrigger({
                ...trigger,
                ioc_types: options.map(({ label }) => label),
              });
            }}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
        <EuiCompressedFormRow label="Log source(s)">
          <EuiCompressedComboBox
            placeholder="Any"
            options={logSources.map((logSource) => ({ label: logSource }))}
            selectedOptions={trigger.data_sources.map((source) => ({ label: source }))}
            onChange={(options) => {
              updateTrigger({
                ...trigger,
                data_sources: options.map(({ label }) => label),
              });
            }}
          />
        </EuiCompressedFormRow>
      </EuiAccordion>
      <EuiSpacer />
      <EuiCompressedFormRow label="Alert severity">
        <EuiCompressedComboBox
          singleSelection
          options={Object.values(ALERT_SEVERITY_OPTIONS)}
          selectedOptions={[
            parseAlertSeverityToOption(trigger.severity) ?? ALERT_SEVERITY_OPTIONS.HIGHEST,
          ]}
          onChange={(options) => {
            updateTrigger({
              ...trigger,
              severity: (options[0]?.value ||
                ALERT_SEVERITY_OPTIONS.HIGHEST.value) as AlertSeverity,
            });
          }}
        />
      </EuiCompressedFormRow>
      <EuiSpacer />
      <NotificationForm
        action={trigger.actions[0]}
        allNotificationChannels={allNotificationChannels}
        loadingNotifications={loadingNotifications}
        onChannelsChange={onChannelsChange}
        onMessageBodyChange={onMessageBodyChange}
        onMessageSubjectChange={onMessageSubjectChange}
        refreshNotificationChannels={refreshNotificationChannels}
        onNotificationToggle={onNotificationToggle}
      />
    </EuiAccordion>
  );
};
