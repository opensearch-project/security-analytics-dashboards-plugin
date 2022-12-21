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
import {
  createSelectedOptions,
  getEmptyAlertCondition,
  parseAlertSeverityToOption,
} from '../../utils/helpers';
import { ALERT_SEVERITY_OPTIONS } from '../../utils/constants';
import { CreateDetectorRulesOptions } from '../../../../../../models/types';
import { NotificationChannelOption, NotificationChannelTypeOptions } from '../../models/interfaces';
import { NOTIFICATIONS_HREF } from '../../../../../../utils/constants';
import { getNameErrorMessage, validateName } from '../../../../../../utils/validation';
import { NotificationsCallOut } from '../../../../../../components/NotificationsCallOut';

interface AlertConditionPanelProps extends RouteComponentProps {
  alertCondition: AlertCondition;
  allNotificationChannels: NotificationChannelTypeOptions[];
  rulesOptions: CreateDetectorRulesOptions;
  detector: Detector;
  indexNum: number;
  isEdit: boolean;
  hasNotificationPlugin: boolean;
  loadingNotifications: boolean;
  onAlertTriggerChanged: (newDetector: Detector) => void;
  refreshNotificationChannels: () => void;
}

interface AlertConditionPanelState {
  nameFieldTouched: boolean;
  nameIsInvalid: boolean;
  previewToggle: boolean;
  selectedNames: EuiComboBoxOptionOption<string>[];
}

export default class AlertConditionPanel extends Component<
  AlertConditionPanelProps,
  AlertConditionPanelState
> {
  constructor(props: AlertConditionPanelProps) {
    super(props);
    this.state = {
      nameFieldTouched: props.isEdit,
      nameIsInvalid: false,
      previewToggle: false,
      selectedNames: [],
    };
  }

  componentDidMount() {
    this.prepareMessage();
  }

  prepareMessage = (updateMessage: boolean = false) => {
    const { alertCondition, detector } = this.props;
    const detectorInput = detector.inputs[0].detector_input;
    const lineBreak = '\n';
    const lineBreakAndTab = '\n\t';

    const alertConditionName = `Triggered alert condition: ${alertCondition.name}`;
    const alertConditionSeverity = `Severity: ${
      parseAlertSeverityToOption(alertCondition.severity)?.label || alertCondition.severity
    }`;
    const detectorName = `Threat detector: ${detector.name}`;
    const defaultSubject = [alertConditionName, alertConditionSeverity, detectorName].join(' - ');

    if (updateMessage || !alertCondition.actions[0]?.subject_template.source)
      this.onMessageSubjectChange(defaultSubject);

    if (updateMessage || !alertCondition.actions[0]?.message_template.source) {
      const selectedNames = this.setSelectedNames(alertCondition.ids);
      const detectorDescription = `Description: ${detectorInput.description}`;
      const detectorIndices = `Detector data sources:${lineBreakAndTab}${detectorInput.indices.join(
        `,${lineBreakAndTab}`
      )}`;
      const ruleNames = `Rule Names:${lineBreakAndTab}${selectedNames.join(`,${lineBreakAndTab}`)}`;
      const ruleSeverities = `Rule Severities:${lineBreakAndTab}${alertCondition.sev_levels.join(
        `,${lineBreakAndTab}`
      )}`;
      const ruleTags = `Rule Tags:${lineBreakAndTab}${alertCondition.tags.join(
        `,${lineBreakAndTab}`
      )}`;

      const alertConditionSelections = [];
      if (selectedNames.length) {
        alertConditionSelections.push(ruleNames);
        alertConditionSelections.push(lineBreak);
      }
      if (alertCondition.sev_levels.length) {
        alertConditionSelections.push(ruleSeverities);
        alertConditionSelections.push(lineBreak);
      }
      if (alertCondition.tags.length) {
        alertConditionSelections.push(ruleTags);
        alertConditionSelections.push(lineBreak);
      }

      const alertConditionDetails = [
        alertConditionName,
        alertConditionSeverity,
        detectorName,
        detectorDescription,
        detectorIndices,
      ];
      let defaultMessageBody = alertConditionDetails.join(lineBreak);
      if (alertConditionSelections.length)
        defaultMessageBody =
          defaultMessageBody + lineBreak + lineBreak + alertConditionSelections.join(lineBreak);
      this.onMessageBodyChange(defaultMessageBody);
    }
  };

  updateTrigger(trigger: Partial<AlertCondition>) {
    const {
      alertCondition,
      onAlertTriggerChanged,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    trigger.types = [detector.detector_type.toLowerCase()];
    const newTriggers = [...triggers];
    newTriggers.splice(indexNum, 1, { ...alertCondition, ...trigger });
    onAlertTriggerChanged({ ...detector, triggers: newTriggers });
  }

  onNameBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      nameFieldTouched: true,
      nameIsInvalid: !validateName(event.target.value),
    });
  };

  onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.updateTrigger({ name: event.target.value.trimStart() });
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
    this.setSelectedNames(ids);
  };

  setSelectedNames = (ids: string[]): string[] => {
    const { rulesOptions } = this.props;
    const selectedNames: string[] = [];
    const selectedNamesOptions: EuiComboBoxOptionOption<string>[] = [];
    ids.forEach((ruleId) => {
      const option = rulesOptions.find((option) => option.id === ruleId);
      if (option) {
        selectedNames.push(option.name);
        selectedNamesOptions.push({ label: option.name, value: option.id });
      }
    });
    this.setState({ selectedNames: selectedNamesOptions });
    return selectedNames;
  };

  render() {
    const {
      alertCondition = getEmptyAlertCondition(),
      allNotificationChannels,
      indexNum,
      loadingNotifications,
      refreshNotificationChannels,
      rulesOptions,
      hasNotificationPlugin,
    } = this.props;
    const { nameFieldTouched, nameIsInvalid, selectedNames } = this.state;
    const { name, sev_levels: ruleSeverityLevels, tags, severity } = alertCondition;
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
    const uniqueRuleNames = new Set<string>();
    const namesOptions: EuiComboBoxOptionOption<string>[] = [];
    rulesOptions.forEach((option) => {
      if (!uniqueRuleNames.has(option.name)) {
        uniqueRuleNames.add(option.name);
        namesOptions.push({
          label: option.name,
          value: option.id,
        });
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
          isInvalid={nameFieldTouched && nameIsInvalid}
          error={getNameErrorMessage(name, nameIsInvalid, nameFieldTouched)}
        >
          <EuiFieldText
            placeholder={'Enter a name for the alert condition.'}
            readOnly={false}
            value={name}
            onBlur={this.onNameBlur}
            onChange={this.onNameChange}
            required={nameFieldTouched}
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
            data-test-subj={`alert-rulename-combo-box`}
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
            data-test-subj={`alert-severity-combo-box`}
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
            data-test-subj={'alert-tags-combo-box'}
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
            data-test-subj={'security-levels-combo-box'}
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
                  value={alertCondition.actions[0]?.subject_template.source}
                  onChange={(e) => this.onMessageSubjectChange(e.target.value)}
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
                  value={alertCondition.actions[0]?.message_template.source}
                  onChange={(e) => this.onMessageBodyChange(e.target.value)}
                  required={true}
                  fullWidth={true}
                />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow>
                <EuiButton fullWidth={false} onClick={() => this.prepareMessage(true)}>
                  Generate message
                </EuiButton>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiAccordion>

        <EuiSpacer size="xl" />
      </div>
    );
  }
}
