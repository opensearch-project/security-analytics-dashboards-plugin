/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiAccordion,
  EuiCheckbox,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiCompressedFormRow,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { AlertCondition } from '../../../../../../../models/interfaces';
import {
  createSelectedOptions,
  getEmptyAlertCondition,
  parseAlertSeverityToOption,
} from '../../utils/helpers';
import { ALERT_SEVERITY_OPTIONS } from '../../utils/constants';
import { CreateDetectorRulesOptions } from '../../../../../../models/types';
import { getNameErrorMessage, validateName } from '../../../../../../utils/validation';
import {
  Detector,
  NotificationChannelOption,
  NotificationChannelTypeOptions,
} from '../../../../../../../types';
import { NotificationForm } from '../../../../../../components/Notifications/NotificationForm';

interface AlertConditionPanelProps extends RouteComponentProps {
  alertCondition: AlertCondition;
  allNotificationChannels: NotificationChannelTypeOptions[];
  rulesOptions: CreateDetectorRulesOptions;
  detector: Detector;
  indexNum: number;
  isEdit: boolean;
  loadingNotifications: boolean;
  onAlertTriggerChanged: (newDetector: Detector, emitMetrics?: boolean) => void;
  refreshNotificationChannels: () => void;
}

interface AlertConditionPanelState {
  nameFieldTouched: boolean;
  nameIsInvalid: boolean;
  previewToggle: boolean;
  selectedNames: EuiComboBoxOptionOption<string>[];
  detectionRulesTriggerEnabled: boolean;
  threatIntelTriggerEnabled: boolean;
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
      detectionRulesTriggerEnabled: props.alertCondition.detection_types.includes('rules'),
      threatIntelTriggerEnabled: props.alertCondition.detection_types.includes('threat_intel'),
    };
  }

  componentDidMount() {
    this.prepareMessage(false /* updateMessage */, true /* onMount */);
  }

  onDetectionTypeChange(detectionType: 'rules' | 'threat_intel', enabled: boolean) {
    const detectionTypes = new Set(this.props.alertCondition.detection_types);
    enabled ? detectionTypes.add(detectionType) : detectionTypes.delete(detectionType);
    this.updateTrigger({
      detection_types: Array.from(detectionTypes),
    });
  }

  // When component mounts, we prepare message but at this point we don't want to emit the
  // trigger changed metric since it is not user initiated. So we use the onMount flag to determine that
  // and pass it downstream accordingly.
  prepareMessage = (updateMessage: boolean = false, onMount: boolean = false) => {
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
      this.onMessageSubjectChange(defaultSubject, !onMount);

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
      this.onMessageBodyChange(defaultMessageBody, !onMount);
    }
  };

  updateTrigger(trigger: Partial<AlertCondition>, emitMetrics: boolean = true) {
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
    onAlertTriggerChanged({ ...detector, triggers: newTriggers }, emitMetrics);
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

  private onNotificationChannelsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const {
      alertCondition,
      onAlertTriggerChanged,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;

    const actions = alertCondition.actions;
    if (selectedOptions.length > 0) {
      actions[0].destination_id = selectedOptions[0].value!;
    } else {
      actions[0].destination_id = '';
    }

    triggers.splice(indexNum, 1, {
      ...alertCondition,
      actions: actions,
    });
    onAlertTriggerChanged({ ...detector, triggers: triggers });
  };

  onMessageSubjectChange = (subject: string, emitMetrics: boolean = true) => {
    const {
      alertCondition: { actions },
    } = this.props;
    actions[0].name = subject;
    actions[0].subject_template.source = subject;
    this.updateTrigger({ actions: actions }, emitMetrics);
  };

  onMessageBodyChange = (message: string, emitMetrics: boolean = true) => {
    const {
      alertCondition: { actions },
    } = this.props;
    actions[0].message_template.source = message;
    this.updateTrigger({ actions: actions }, emitMetrics);
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
      detector: { threat_intel_enabled: threatIntelEnabledInDetector },
      indexNum,
      loadingNotifications,
      refreshNotificationChannels,
      rulesOptions,
    } = this.props;
    const {
      nameFieldTouched,
      nameIsInvalid,
      selectedNames,
      detectionRulesTriggerEnabled,
      threatIntelTriggerEnabled,
    } = this.state;
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

    const triggerDetailsSubheading = `
      ${
        selectedNames.length === 1
          ? '1 rule'
          : `${!selectedNames.length ? 'All' : selectedNames.length} rules`
      },
      ${
        ruleSeverityLevels.length === 1
          ? '1 severity'
          : `${!ruleSeverityLevels.length ? 'All' : ruleSeverityLevels.length} severities`
      },
      ${tags.length === 1 ? '1 tag' : `${!tags.length ? 'All' : tags.length} tags`}
    `;

    return (
      <div>
        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <p>Trigger name</p>
            </EuiText>
          }
          isInvalid={nameFieldTouched && nameIsInvalid}
          error={getNameErrorMessage(name, nameIsInvalid, nameFieldTouched)}
        >
          <EuiFieldText
            placeholder={'Enter a name to describe the alert condition'}
            readOnly={false}
            value={name}
            onBlur={this.onNameBlur}
            onChange={this.onNameChange}
            required={nameFieldTouched}
            data-test-subj={`alert-condition-name-${indexNum}`}
          />
        </EuiCompressedFormRow>
        <EuiSpacer size={'l'} />

        <EuiTitle size="s">
          <h4>Detection type</h4>
        </EuiTitle>

        {threatIntelEnabledInDetector ? (
          <EuiCheckbox
            id="detection-type-rules"
            label="Detection rules"
            checked={detectionRulesTriggerEnabled}
            onChange={(e) => {
              this.setState({ detectionRulesTriggerEnabled: e.target.checked });
              this.onDetectionTypeChange('rules', e.target.checked);
            }}
          />
        ) : (
          <EuiText>
            <p>Detection rules</p>
          </EuiText>
        )}

        <EuiSpacer size="m" />

        {detectionRulesTriggerEnabled && (
          <>
            <EuiAccordion
              id={`trigger-details-${indexNum}`}
              paddingSize="l"
              initialIsOpen={this.props.isEdit}
              buttonContent={
                <div data-test-subj="trigger-details-btn">
                  <EuiText size={'s'}>Trigger condition</EuiText>
                  <EuiText size="s" color="subdued">
                    {triggerDetailsSubheading}
                  </EuiText>
                </div>
              }
            >
              <EuiCompressedFormRow
                label={
                  <EuiText size="s">
                    <p>Rule names</p>
                  </EuiText>
                }
              >
                <EuiComboBox
                  placeholder={'Any rules'}
                  options={namesOptions}
                  onChange={this.onRuleNamesChange}
                  selectedOptions={selectedNames}
                  data-test-subj={`alert-rulename-combo-box`}
                />
              </EuiCompressedFormRow>
              <EuiSpacer size={'m'} />

              <EuiCompressedFormRow
                label={
                  <EuiText size="s">
                    <p>Rule Severities</p>
                  </EuiText>
                }
              >
                <EuiComboBox
                  placeholder={'Any severities'}
                  options={ruleSeverityOptions}
                  onChange={this.onRuleSeverityChange}
                  noSuggestions={false}
                  selectedOptions={createSelectedOptions(ruleSeverityLevels)}
                  data-test-subj={`alert-severity-combo-box`}
                />
              </EuiCompressedFormRow>
              <EuiSpacer size={'m'} />

              <EuiCompressedFormRow
                label={
                  <EuiText size="s">
                    <p>Tags</p>
                  </EuiText>
                }
              >
                <EuiComboBox
                  placeholder={'Any tags'}
                  options={tagsOptions}
                  onChange={this.onTagsChange}
                  onCreateOption={this.onCreateTag}
                  selectedOptions={createSelectedOptions(tags)}
                  data-test-subj={'alert-tags-combo-box'}
                />
              </EuiCompressedFormRow>
            </EuiAccordion>

            <EuiSpacer size="m" />
          </>
        )}

        {threatIntelEnabledInDetector && (
          <>
            <EuiCheckbox
              id="detection-type-threat-intel"
              label="Threat intelligence"
              checked={threatIntelTriggerEnabled}
              onChange={(e) => {
                this.setState({ threatIntelTriggerEnabled: e.target.checked });
                this.onDetectionTypeChange('threat_intel', e.target.checked);
              }}
            />

            {threatIntelTriggerEnabled && (
              <>
                <EuiSpacer size="s" />
                <EuiText>
                  <p>
                    An alert will be generated when any match is found by the threat intelligence
                    feed.
                  </p>
                </EuiText>
                <EuiSpacer size="s" />
              </>
            )}
          </>
        )}

        <EuiSpacer size="s" />

        {!detectionRulesTriggerEnabled && !threatIntelTriggerEnabled && (
          <>
            <EuiText color="danger">
              <p>Select detection type for the trigger</p>
            </EuiText>
            <EuiSpacer size="s" />
          </>
        )}

        <EuiSpacer size="s" />

        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <p>Alert severity</p>
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
        </EuiCompressedFormRow>

        <EuiSpacer size={'l'} />

        <NotificationForm
          action={alertCondition.actions[0]}
          allNotificationChannels={allNotificationChannels}
          loadingNotifications={loadingNotifications}
          prepareMessage={this.prepareMessage}
          refreshNotificationChannels={refreshNotificationChannels}
          onChannelsChange={this.onNotificationChannelsChange}
          onMessageBodyChange={this.onMessageBodyChange}
          onMessageSubjectChange={this.onMessageSubjectChange}
        />
      </div>
    );
  }
}
