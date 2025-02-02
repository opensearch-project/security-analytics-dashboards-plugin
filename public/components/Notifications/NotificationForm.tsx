/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiSmallButton,
  EuiCompressedComboBox,
  EuiComboBoxOptionOption,
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiSpacer,
  EuiCompressedSwitch,
  EuiText,
  EuiCompressedTextArea,
  EuiCompressedCheckbox,
} from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { NOTIFICATIONS_HREF } from '../../utils/constants';
import { NotificationsCallOut } from '../NotificationsCallOut';
import {
  NotificationChannelOption,
  NotificationChannelTypeOptions,
  TriggerAction,
  TriggerContext,
} from '../../../types';
import { getIsNotificationPluginInstalled } from '../../utils/helpers';
import { render } from 'mustache';

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
  context: TriggerContext;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  action,
  context,
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
  const [displayPreview, setDisplayPreview] = useState(false);
  const onDisplayPreviewChange = useCallback((e) => setDisplayPreview(e.target.checked), [
    displayPreview,
  ]);
  if (shouldSendNotification && action?.destination_id) {
    allNotificationChannels.forEach((typeOption) => {
      const matchingChannel = typeOption.options.find(
        (option) => option.value === action.destination_id
      );
      if (matchingChannel) selectedNotificationChannelOption.push(matchingChannel);
    });
  }
  let preview = '';
  try {
    preview = `${render(action?.subject_template.source, context)}\n\n${render(
      action?.message_template.source,
      context
    )}`;
  } catch (err) {
    preview = `There was an error rendering message preview: ${err.message}`;
    console.error('There was an error rendering mustache template', err);
  }
  ``;
  return (
    <>
      <EuiCompressedSwitch
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
              <EuiCompressedFormRow
                label={
                  <EuiText size="m">
                    <p>Notification channel</p>
                  </EuiText>
                }
              >
                <EuiCompressedComboBox
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
              </EuiCompressedFormRow>
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
                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <p>Message subject</p>
                    </EuiText>
                  }
                  fullWidth={true}
                >
                  <EuiCompressedFieldText
                    placeholder={'Enter a subject for the notification message.'}
                    value={action?.subject_template.source}
                    onChange={(e) => onMessageSubjectChange(e.target.value)}
                    required={true}
                    fullWidth={true}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiCompressedFormRow
                  label={
                    <EuiText size="s">
                      <p>Message body</p>
                    </EuiText>
                  }
                  fullWidth={true}
                >
                  <EuiCompressedTextArea
                    placeholder={'Enter the content of the notification message.'}
                    value={action?.message_template.source}
                    onChange={(e) => onMessageBodyChange(e.target.value)}
                    required={true}
                    fullWidth={true}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiCompressedCheckbox
                  id="notification-message-preview-checkbox"
                  label="Preview message"
                  checked={displayPreview}
                  onChange={onDisplayPreviewChange}
                />
              </EuiFlexItem>
              {displayPreview && (
                <EuiFlexItem>
                  <EuiCompressedFormRow label="Message preview" fullWidth>
                    <EuiCompressedTextArea
                      placeholder="Preview of mustache template"
                      fullWidth
                      value={preview}
                      readOnly
                    />
                  </EuiCompressedFormRow>
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
