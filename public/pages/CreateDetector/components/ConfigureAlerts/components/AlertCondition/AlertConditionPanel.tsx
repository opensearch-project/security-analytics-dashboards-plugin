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
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Detector } from '../../../../../../../models/interfaces';
import { AlertCondition } from '../../../../../../../models/interfaces';
import { createSelectedOptions, parseAlertSeverityListToOptions } from '../../utils/helpers';
import { ALERT_SEVERITY_OPTIONS, RULE_SEVERITY_OPTIONS } from '../../utils/constants';
import { parseStringsToOptions } from '../../../../../../utils/helpers';

interface AlertConditionPanelProps extends RouteComponentProps {
  alertCondition: AlertCondition;
  allNotificationChannels: string[]; // TODO: Notification channels will likely be more complex objects
  allRuleTypes: string[];
  detector: Detector;
  indexNum: number;
  isEdit: boolean;
  loadingNotifications: boolean;
  onAlertTriggerChanged: (newDetector: Detector) => void;
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
    const severitySelections = selectedOptions.map((option) => option.label);
    this.updateTrigger({ actions: severitySelections });
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
    // const channelIds = selectedOptions.map((channel) => channel.label);
    const {
      alertCondition,
      onAlertTriggerChanged,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    triggers.splice(indexNum, 1, {
      ...alertCondition,
    });
    onAlertTriggerChanged({ ...detector, triggers: triggers });
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

  render() {
    const { alertCondition, allNotificationChannels, indexNum, loadingNotifications } = this.props;
    const { name, sev_levels: ruleSeverityLevels, tags } = alertCondition;
    const alertSeverityLevels: string[] = [];
    return (
      <EuiPanel>
        <EuiAccordion
          id={`alert-condition-${indexNum}`}
          buttonContent={
            <EuiTitle>
              <h4>Alert trigger</h4>
            </EuiTitle>
          }
          paddingSize={'none'}
          initialIsOpen={true}
          extraAction={
            indexNum > 0 && <EuiButton onClick={this.onDelete}>Remove alert condition</EuiButton>
          }
        >
          <EuiHorizontalRule margin={'xs'} />
          <EuiSpacer size={'m'} />

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
                <p>Rule Severities</p>
              </EuiText>
            }
          >
            <EuiComboBox
              placeholder={'Select rule severities.'}
              options={Object.values(RULE_SEVERITY_OPTIONS)}
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
              options={Object.values(RULE_SEVERITY_OPTIONS)}
              onChange={this.onTagsChange}
              onCreateOption={this.onCreateTag}
              noSuggestions={true}
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
              selectedOptions={parseAlertSeverityListToOptions(alertSeverityLevels)}
              onChange={this.onAlertSeverityChange}
            />
          </EuiFormRow>

          <EuiSpacer size={'l'} />

          <EuiFlexGroup alignItems="flexEnd">
            <EuiFlexItem style={{ maxWidth: 400 }}>
              <EuiFormRow
                label={
                  <EuiText size="m">
                    <p>Select channels to notify</p>
                  </EuiText>
                }
              >
                <EuiComboBox
                  placeholder={'Select notification channels.'}
                  async={true}
                  isLoading={loadingNotifications}
                  options={parseStringsToOptions(allNotificationChannels)}
                  onChange={this.onNotificationChannelsChange}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton>Manage channels</EuiButton>
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
            <p>Notification message</p>
            <EuiSpacer size="xxl" />
          </EuiAccordion>

          <EuiSpacer size="xl" />
        </EuiAccordion>
      </EuiPanel>
    );
  }
}
