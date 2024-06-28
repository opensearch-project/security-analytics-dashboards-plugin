/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTextArea,
} from '@elastic/eui';
import React, { useState } from 'react';
import { NOTIFICATIONS_HREF } from '../../utils/constants';
import { NotificationsCallOut } from '../NotificationsCallOut';
import {
  NotificationChannelOption,
  NotificationChannelTypeOptions,
  TriggerAction,
} from '../../../types';
import { getIsNotificationPluginInstalled } from '../../utils/helpers';

export interface NotificationFormProps {
  allNotificationChannels: NotificationChannelTypeOptions[];
  loadingNotifications: boolean;
  action: TriggerAction;
  prepareMessage: (updateMessage?: boolean, onMount?: boolean) => void;
  refreshNotificationChannels: () => void;
  onChannelsChange: (selectedOptions: EuiComboBoxOptionOption<string>[]) => void;
  onMessageBodyChange: (message: string) => void;
  onMessageSubjectChange: (subject: string) => void;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  action,
  allNotificationChannels,
  loadingNotifications,
  prepareMessage,
  refreshNotificationChannels,
  onChannelsChange,
  onMessageBodyChange,
  onMessageSubjectChange,
}) => {
  const hasNotificationPlugin = getIsNotificationPluginInstalled();
  const [showNotificationDetails, setShowNotificationDetails] = useState(true);
  const selectedNotificationChannelOption: NotificationChannelOption[] = [];
  if (action.destination_id) {
    allNotificationChannels.forEach((typeOption) => {
      const matchingChannel = typeOption.options.find(
        (option) => option.value === action.destination_id
      );
      if (matchingChannel) selectedNotificationChannelOption.push(matchingChannel);
    });
  }

  return (
    <>
      <EuiSwitch
        label="Send notification"
        checked={showNotificationDetails}
        onChange={(e) => setShowNotificationDetails(e.target.checked)}
      />
      <EuiSpacer />
      {showNotificationDetails && (
        <>
          <EuiFlexGroup alignItems={'flexEnd'}>
            <EuiFlexItem style={{ maxWidth: 400 }}>
              <EuiFormRow
                label={
                  <EuiText size="m">
                    <p>Notification channel</p>
                  </EuiText>
                }
              >
                <EuiComboBox
                  placeholder={'Select notification channel.'}
                  async={true}
                  isLoading={loadingNotifications}
                  options={allNotificationChannels as EuiComboBoxOptionOption<string>[]}
                  selectedOptions={
                    selectedNotificationChannelOption as EuiComboBoxOptionOption<string>[]
                  }
                  onChange={onChannelsChange}
                  singleSelection={{ asPlainText: true }}
                  onFocus={refreshNotificationChannels}
                  isDisabled={!hasNotificationPlugin}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                href={NOTIFICATIONS_HREF}
                iconType={'popout'}
                target={'_blank'}
                isDisabled={!hasNotificationPlugin}
              >
                Manage channels
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>

          {!hasNotificationPlugin && (
            <>
              <EuiSpacer size="m" />
              <NotificationsCallOut />
            </>
          )}

          <EuiSpacer size={'l'} />

          <EuiAccordion
            id={`alert-condition-notify-msg-${action.id ?? 'draft'}`}
            buttonContent={
              <EuiText size="m">
                <p>Notification message</p>
              </EuiText>
            }
            paddingSize={'l'}
            initialIsOpen={false}
          >
            <EuiFlexGroup direction={'column'} style={{ width: '75%' }}>
              <EuiFlexItem>
                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <p>Message subject</p>
                    </EuiText>
                  }
                  fullWidth={true}
                >
                  <EuiFieldText
                    placeholder={'Enter a subject for the notification message.'}
                    value={action?.subject_template.source}
                    onChange={(e) => onMessageSubjectChange(e.target.value)}
                    required={true}
                    fullWidth={true}
                  />
                </EuiFormRow>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFormRow
                  label={
                    <EuiText size="s">
                      <p>Message body</p>
                    </EuiText>
                  }
                  fullWidth={true}
                >
                  <EuiTextArea
                    placeholder={'Enter the content of the notification message.'}
                    value={action?.message_template.source}
                    onChange={(e) => onMessageBodyChange(e.target.value)}
                    required={true}
                    fullWidth={true}
                  />
                </EuiFormRow>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFormRow>
                  <EuiButton
                    fullWidth={false}
                    onClick={() => prepareMessage(true /* updateMessage */)}
                  >
                    Generate message
                  </EuiButton>
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiAccordion>

          <EuiSpacer size="xl" />
        </>
      )}
    </>
  );
};
