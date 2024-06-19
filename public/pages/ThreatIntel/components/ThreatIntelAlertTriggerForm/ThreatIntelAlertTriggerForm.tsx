/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButtonIcon,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFormRow,
  EuiSpacer,
} from '@elastic/eui';
import { NotificationChannelTypeOptions, ThreatIntelAlertTrigger } from '../../../../../types';
import React from 'react';
import { NotificationForm } from '../../../../components/Notifications/NotificationForm';

export interface ThreatIntelAlertTriggerProps {
  allNotificationChannels: NotificationChannelTypeOptions[];
  loadingNotifications: boolean;
  trigger: ThreatIntelAlertTrigger;
  onDeleteTrgger: () => void;
  refreshNotificationChannels: () => void;
  updateTrigger: (trigger: ThreatIntelAlertTrigger) => void;
}

export const ThreatIntelAlertTriggerForm: React.FC<ThreatIntelAlertTriggerProps> = ({
  allNotificationChannels,
  loadingNotifications,
  trigger,
  onDeleteTrgger,
  refreshNotificationChannels,
  updateTrigger,
}) => {
  const onChannelsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    updateTrigger({
      ...trigger,
      action: {
        ...trigger.action,
        destination_id: selectedOptions[0]?.value || '',
        destination_name: selectedOptions[0].label || '',
      },
    });
  };

  const onMessageSubjectChange = (subject: string) => {
    updateTrigger({
      ...trigger,
      action: {
        ...trigger.action,
        name: subject,
        subject_template: {
          ...trigger.action.subject_template,
          source: subject,
        },
      },
    });
  };

  const onMessageBodyChange = (message: string) => {
    updateTrigger({
      ...trigger,
      action: {
        ...trigger.action,
        message_template: {
          ...trigger.action.message_template,
          source: message,
        },
      },
    });
  };

  const prepareMessage = () => {};

  return (
    <EuiAccordion
      id="threat-intel-trigger"
      initialIsOpen={true}
      buttonContent={trigger.name}
      extraAction={<EuiButtonIcon iconType={'trash'} onClick={onDeleteTrgger} />}
      paddingSize="l"
    >
      <EuiFormRow>
        <EuiFieldText placeholder="Trigger name" />
      </EuiFormRow>
      <EuiSpacer />
      <EuiAccordion
        id={'threat-intel-trigger-condition'}
        buttonContent="Trigger condition"
        initialIsOpen={true}
        paddingSize="l"
      >
        <EuiFormRow label="Indicator type(s)">
          <EuiComboBox />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFormRow label="Log source(s)">
          <EuiComboBox />
        </EuiFormRow>
      </EuiAccordion>
      <EuiSpacer />
      <NotificationForm
        action={trigger.action}
        allNotificationChannels={allNotificationChannels}
        loadingNotifications={loadingNotifications}
        onChannelsChange={onChannelsChange}
        onMessageBodyChange={onMessageBodyChange}
        onMessageSubjectChange={onMessageSubjectChange}
        prepareMessage={prepareMessage}
        refreshNotificationChannels={refreshNotificationChannels}
      />
    </EuiAccordion>
  );
};
