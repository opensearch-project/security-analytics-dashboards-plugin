/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiSmallButton,
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
  action?: TriggerAction;
  prepareMessage?: (updateMessage?: boolean, onMount?: boolean) => void;
  refreshNotificationChannels: () => void;
  onChannelsChange: (selectedOptions: EuiComboBoxOptionOption<string>[]) => void;
  onMessageBodyChange: (message: string) => void;
  onMessageSubjectChange: (subject: string) => void;
  onNotificationToggle?: (enabled: boolean) => void;
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
  onNotificationToggle,
}) => {
  const hasNotificationPlugin = getIsNotificationPluginInstalled();
  const [shouldSendNotification, setShouldSendNotification] = useState(!!action?.destination_id);
  const selectedNotificationChannelOption: NotificationChannelOption[] = [];
  if (shouldSendNotification && action?.destination_id) {
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
        checked={shouldSendNotification}
        onChange={(e) => {
          setShouldSendNotification(e.target.checked);
          onNotificationToggle?.(e.target.checked);
        }}
      />
      <EuiSpacer />
      {shouldSendNotification && (
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
              <EuiSmallButton
                href={NOTIFICATIONS_HREF}
                iconType={'popout'}
                target={'_blank'}
                isDisabled={!hasNotificationPlugin}
              >
                Manage channels
              </EuiSmallButton>
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
            id={`alert-condition-notify-msg-${action?.id ?? 'draft'}`}
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
              {prepareMessage && (
                <EuiFlexItem>
                  <EuiFormRow>
                    <EuiSmallButton
                      fullWidth={false}
                      onClick={() => prepareMessage(true /* updateMessage */)}
                    >
                      Generate message
                    </EuiSmallButton>
                  </EuiFormRow>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiAccordion>

          <EuiSpacer size="xl" />
        </>
      )}
    </>
  );
};
