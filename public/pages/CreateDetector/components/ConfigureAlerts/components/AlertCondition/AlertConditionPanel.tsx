/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
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
  EuiText,
  EuiTextArea,
} from '@elastic/eui';
import { Detector } from '../../../../../../../models/interfaces';
import { AlertCondition } from '../../../../../../../models/interfaces';
import { createSelectedOptions, parseAlertSeverityToOption } from '../../utils/helpers';
import { ALERT_SEVERITY_OPTIONS, EMPTY_DEFAULT_ALERT_CONDITION } from '../../utils/constants';
import { CreateDetectorRulesOptions } from '../../../../../../models/types';
import { NotificationChannelOption, NotificationChannelTypeOptions } from '../../models/interfaces';
import { NOTIFICATIONS_HREF } from '../../../../../../utils/constants';

interface AlertConditionPanelProps extends RouteComponentProps {
  alertCondition: AlertCondition;
  allNotificationChannels: NotificationChannelTypeOptions[];
  rulesOptions: CreateDetectorRulesOptions;
  detector: Detector;
  indexNum: number;
  isEdit: boolean;
  loadingNotifications: boolean;
  onAlertTriggerChanged: (newDetector: Detector) => void;
  refreshNotificationChannels: () => void;
}

interface AlertConditionPanelState {}

export default class AlertConditionPanel extends Component<
  AlertConditionPanelProps,
  AlertConditionPanelState
> {
  constructor(props: AlertConditionPanelProps) {
    super(props);
    this.state = {
      previewToggle: false,
    };
  }

  componentDidMount() {
    this.prepareMessage();
  }

  prepareMessage = async () => {
    const { alertCondition, detector, indexNum } = this.props;
    if (!alertCondition.actions[0]?.subject_template.source)
      await this.onMessageSubjectChange(`${detector.name} alert condition number ${indexNum + 1}.`);
    if (!alertCondition.actions[0]?.message_template.source)
      await this.onMessageBodyChange(
        `Alert condition number ${indexNum + 1} for detector "${detector.name}" has been triggered.`
      );
  };

  updateTrigger(trigger: Partial<AlertCondition>) {
    const {
      alertCondition,
      onAlertTriggerChanged,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    trigger.types = [detector.detector_type];
    const newTriggers = [...triggers];
    newTriggers.splice(indexNum, 1, { ...alertCondition, ...trigger });
    onAlertTriggerChanged({ ...detector, triggers: newTriggers });
  }

  onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    this.updateTrigger({
      name,
    });
  };

  onRuleSeverityChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const severitySelections = selectedOptions.map((option) => option.label);
    this.updateTrigger({ sev_levels: severitySelections });
  };

  onAlertSeverityChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const severitySelections = selectedOptions.map((option) => option.value);
    if (severitySelections.length > 0) {
      this.updateTrigger({ severity: severitySelections[0] });
    }
  };

  onCreateTag = (value: string) => {
    const {
      alertCondition: { tags },
    } = this.props;
    const tagOptions = tags.map((tag) => ({ label: tag }));
    tagOptions.push({ label: value });
    this.onTagsChange(tagOptions);
  };

  onTagsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const tags = selectedOptions.map((tag) => tag.label);
    this.updateTrigger({ tags });
  };

  onNotificationChannelsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const {
      alertCondition,
      onAlertTriggerChanged,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;

    const actions = alertCondition.actions;
    actions[0].destination_id = selectedOptions.length > 0 ? selectedOptions[0].value! : '';

    triggers.splice(indexNum, 1, {
      ...alertCondition,
      actions: actions,
    });
    onAlertTriggerChanged({ ...detector, triggers: triggers });
  };

  onMessageSubjectChange = (subject: string) => {
    const {
      alertCondition: { actions },
    } = this.props;
    actions[0].name = subject;
    actions[0].subject_template.source = subject;
    this.updateTrigger({ actions: actions });
  };

  onMessageBodyChange = (message: string) => {
    const {
      alertCondition: { actions },
    } = this.props;
    actions[0].message_template.source = message;
    this.updateTrigger({ actions: actions });
  };

  onDelete = () => {
    const {
      onAlertTriggerChanged,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    const newTriggers = [...triggers];
    delete newTriggers[indexNum];
    onAlertTriggerChanged({ ...detector, triggers: newTriggers });
  };

  onRuleNamesChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const ids = selectedOptions.map((nameOption) => nameOption.value as string);
    this.updateTrigger({ ids });
  };

  render() {
    const {
      alertCondition = EMPTY_DEFAULT_ALERT_CONDITION,
      allNotificationChannels,
      indexNum,
      loadingNotifications,
      refreshNotificationChannels,
      rulesOptions,
    } = this.props;
    const { name, sev_levels: ruleSeverityLevels, tags, severity, ids } = alertCondition;
    const uniqueTagsOptions = new Set(
      rulesOptions.map((option) => option.tags).reduce((prev, current) => prev.concat(current), [])
    );
    const tagsOptions: { label: string }[] = [];
    uniqueTagsOptions.forEach((tag) => {
      tagsOptions.push({
        label: tag,
      });
    });

    const uniqueRuleSeverityOptions = new Set(rulesOptions.map((option) => option.severity));
    const ruleSeverityOptions: { label: string }[] = [];
    uniqueRuleSeverityOptions.forEach((severity) => {
      ruleSeverityOptions.push({
        label: severity,
      });
    });
    const namesOptions: EuiComboBoxOptionOption<string>[] = rulesOptions.map((option) => ({
      label: option.name,
      value: option.id,
    }));
    const selectedNames: EuiComboBoxOptionOption<string>[] = [];
    ids.forEach((ruleId) => {
      const option = rulesOptions.find((option) => option.id === ruleId);
      if (option) {
        selectedNames.push({ label: option.name, value: option.id });
      }
    });

    const channelId = alertCondition.actions[0].destination_id;
    const selectedNotificationChannelOption: NotificationChannelOption[] = [];
    if (channelId) {
      allNotificationChannels.forEach((typeOption) => {
        const matchingChannel = typeOption.options.find((option) => option.value === channelId);
        if (matchingChannel) selectedNotificationChannelOption.push(matchingChannel);
      });
    }

    return (
      <div>
        <EuiFormRow
          label={
            <EuiText size="s">
              <p>Trigger name</p>
            </EuiText>
          }
        >
          <EuiFieldText
            placeholder={'Enter a name for the alert condition.'}
            readOnly={false}
            value={name}
            onChange={this.onNameChange}
            data-test-subj={`alert-condition-name-${indexNum}`}
          />
        </EuiFormRow>

        <EuiSpacer size={'xxl'} />
        <EuiText size="m" style={{ fontSize: 20 }}>
          <p>If a detection rule matches</p>
        </EuiText>
        <EuiSpacer size={'m'} />

        <EuiFormRow
          label={
            <EuiText size="s">
              <p>Rule names</p>
            </EuiText>
          }
        >
          <EuiComboBox
            placeholder={'Select rule names.'}
            options={namesOptions}
            onChange={this.onRuleNamesChange}
            selectedOptions={selectedNames}
          />
        </EuiFormRow>
        <EuiSpacer size={'m'} />

        <EuiFormRow
          label={
            <EuiText size="s">
              <p>Rule Severities</p>
            </EuiText>
          }
        >
          <EuiComboBox
            placeholder={'Select rule severities.'}
            options={ruleSeverityOptions}
            onChange={this.onRuleSeverityChange}
            noSuggestions={false}
            selectedOptions={createSelectedOptions(ruleSeverityLevels)}
          />
        </EuiFormRow>
        <EuiSpacer size={'m'} />

        <EuiFormRow
          label={
            <EuiText size="s">
              <p>Tags</p>
            </EuiText>
          }
        >
          <EuiComboBox
            placeholder={'Enter tags for the alert condition.'}
            options={tagsOptions}
            onChange={this.onTagsChange}
            onCreateOption={this.onCreateTag}
            selectedOptions={createSelectedOptions(tags)}
          />
        </EuiFormRow>

        <EuiSpacer size={'xxl'} />

        <EuiText size="m" style={{ fontSize: 20 }}>
          <p>Alert and notify</p>
        </EuiText>
        <EuiSpacer size={'m'} />

        <EuiFormRow
          label={
            <EuiText size="s">
              <p>Specify alert severity</p>
            </EuiText>
          }
        >
          <EuiComboBox
            placeholder={'Select applicable severity levels.'}
            async={true}
            options={Object.values(ALERT_SEVERITY_OPTIONS)}
            selectedOptions={
              severity ? [parseAlertSeverityToOption(severity)] : [ALERT_SEVERITY_OPTIONS.HIGHEST]
            }
            onChange={this.onAlertSeverityChange}
            singleSelection={{ asPlainText: true }}
            isClearable={false}
          />
        </EuiFormRow>

        <EuiSpacer size={'l'} />

        <EuiFlexGroup alignItems="flexEnd">
          <EuiFlexItem style={{ maxWidth: 400 }}>
            <EuiFormRow
              label={
                <EuiText size="m">
                  <p>Select channel to notify</p>
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
                onChange={this.onNotificationChannelsChange}
                singleSelection={{ asPlainText: true }}
                onBlur={refreshNotificationChannels}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton href={NOTIFICATIONS_HREF} iconType={'popout'} target={'_blank'}>
              Manage channels
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size={'xxl'} />

        <EuiAccordion
          id={`alert-condition-notify-msg-${indexNum}`}
          buttonContent={
            <EuiText size="m">
              <p>Show notify message</p>
            </EuiText>
          }
          paddingSize={'none'}
          initialIsOpen={false}
        >
          <EuiSpacer size={'m'} />
          <EuiFormRow
            label={
              <EuiText size={'s'}>
                <p>Message subject</p>
              </EuiText>
            }
          >
            <EuiFieldText
              placeholder={'Enter a subject for the notification message.'}
              value={alertCondition.actions[0]?.subject_template.source}
              onChange={(e) => this.onMessageSubjectChange(e.target.value)}
              required={true}
            />
          </EuiFormRow>
          <EuiSpacer size={'m'} />
          <EuiFormRow
            label={
              <EuiText size="s">
                <p>Message body</p>
              </EuiText>
            }
          >
            <EuiTextArea
              placeholder={'Enter the content of the notification message.'}
              value={alertCondition.actions[0]?.message_template.source}
              onChange={(e) => this.onMessageBodyChange(e.target.value)}
              required={true}
            />
          </EuiFormRow>
        </EuiAccordion>

        <EuiSpacer size="xl" />
      </div>
    );
  }
}
