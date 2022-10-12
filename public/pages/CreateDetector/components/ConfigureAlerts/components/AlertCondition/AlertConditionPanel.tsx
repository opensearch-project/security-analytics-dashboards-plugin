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
  EuiFieldText,
  EuiFormRow,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
} from '@elastic/eui';
import { Detector } from '../../../../../../../models/interfaces';
import { AlertCondition } from '../../../../../../../models/interfaces';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { parseSeverityListToOptions } from '../../utils/helpers';
import { SEVERITY_OPTIONS } from '../../utils/constants';
import { parseStringsToOptions } from '../../../../../../utils/helpers';

interface AlertConditionPanelProps extends RouteComponentProps {
  alertCondition: AlertCondition;
  allNotificationChannels: string[]; // TODO: Notification channels will likely be more complex objects
  allRuleTypes: string[];
  changeDetector: (detector: Detector) => void;
  detector: Detector;
  indexNum: number;
  isEdit: boolean;
  loadingNotifications: boolean;
}

interface AlertConditionPanelState {
  previewToggle: boolean;
}

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

  onNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { alert_conditions },
      indexNum,
    } = this.props;
    alert_conditions.splice(indexNum, 1, { ...alertCondition, name: name });
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  onRuleTypesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const ruleTypes = (e as object[]).map((ruleType) => ruleType.label);
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { alert_conditions },
      indexNum,
    } = this.props;
    alert_conditions.splice(indexNum, 1, { ...alertCondition, rule_types: ruleTypes });
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  onSeverityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const severitySelections = (e as object[]).map((severity) => severity.value);
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { alert_conditions },
    } = this.props;
    alert_conditions.splice(indexNum, 1, { ...alertCondition, severity: severitySelections });
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  onCreateTag = (value: string) => {
    const {
      alertCondition: { tags },
    } = this.props;
    const tagOptions = tags.map((tag) => ({ label: tag }));
    tagOptions.push({ label: value });
    this.onTagsChange(tagOptions as ChangeEvent<HTMLSelectElement>);
  };

  onTagsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const tags = (e as object[]).map((tag) => tag.label);
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { alert_conditions },
      indexNum,
    } = this.props;
    alert_conditions.splice(indexNum, 1, { ...alertCondition, tags: tags });
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  onNotificationChannelsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const channelIds = (e as object[]).map((channel) => channel.label);
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { alert_conditions },
      indexNum,
    } = this.props;
    alert_conditions.splice(indexNum, 1, {
      ...alertCondition,
      notification_channel_ids: channelIds,
    });
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  onDelete = () => {
    const {
      changeDetector,
      detector,
      detector: { alert_conditions },
      indexNum,
    } = this.props;
    delete alert_conditions[indexNum];
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  togglePreview = () => {
    const { previewToggle } = this.state;
    this.setState({ previewToggle: !previewToggle });
  };

  // parseStringsToOptions = (strings: string[]) => {
  //   return strings.map((str) => );
  // } // TODO hurneyt

  render() {
    const {
      alertCondition,
      allNotificationChannels,
      allRuleTypes,
      indexNum,
      isEdit,
      loadingNotifications,
    } = this.props;
    const { previewToggle } = this.state;
    const { name, rule_types, severity, tags, notification_channel_ids } = alertCondition;
    return (
      <EuiPanel>
        <EuiAccordion
          id={`alert-condition-${indexNum}`}
          buttonContent={
            <EuiTitle>
              <h4>{name || `${indexNum ? 'New alert' : 'Alert'} condition`}</h4>
            </EuiTitle>
          }
          paddingSize={'none'}
          initialIsOpen={!isEdit}
          extraAction={
            indexNum > 0 && <EuiButton onClick={this.onDelete}>Remove alert condition</EuiButton>
          }
        >
          <EuiHorizontalRule margin={'xs'} />
          <EuiSpacer size={'m'} />

          <EuiFormRow
            label={<FormFieldHeader headerTitle={'Name'} />}
            // isInvalid={isInvalid}
            // error={isInvalid && this.getErrorMessage()}
          >
            <EuiFieldText
              placeholder={'Enter a name for the alert condition.'}
              readOnly={false}
              value={name}
              onChange={this.onNameChange}
              data-test-subj={`alert-condition-name-${indexNum}`}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />
          <EuiTitle>
            <h4>If a detection rule matches</h4>
          </EuiTitle>
          <EuiSpacer size={'m'} />

          <EuiFormRow
            label={<FormFieldHeader headerTitle={'Rule types'} />}
            // isInvalid={isInvalid}
            // error={isInvalid && this.getErrorMessage()}
          >
            <EuiComboBox
              placeholder={'Select applicable rule types.'}
              async={true}
              // isLoading={loading}
              options={parseStringsToOptions(allRuleTypes)}
              selectedOptions={parseStringsToOptions(rule_types)}
              onChange={this.onRuleTypesChange}
              // isInvalid={isInvalid}
              // data-test-subj={"define-detector-detector-name"}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />

          <EuiFormRow
            label={<FormFieldHeader headerTitle={'Severity levels'} />}
            // isInvalid={isInvalid}
            // error={isInvalid && this.getErrorMessage()}
          >
            <EuiComboBox
              placeholder={'Select applicable severity levels.'}
              async={true}
              // isLoading={loading}
              options={Object.values(SEVERITY_OPTIONS)}
              selectedOptions={parseSeverityListToOptions(severity)}
              onChange={this.onSeverityChange}
              // isInvalid={isInvalid}
              // data-test-subj={"define-detector-detector-name"}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />

          {/*// TODO: Are tags configured by the user, or returned by an API?*/}
          <EuiFormRow
            label={<FormFieldHeader headerTitle={'Tags'} />}
            // isInvalid={isInvalid}
            // error={isInvalid && this.getErrorMessage()}
          >
            <EuiComboBox
              placeholder={'Enter tags for the alert condition.'}
              // async={true}
              // isLoading={loading}
              // options={Object.values(SEVERITY_OPTIONS)}
              selectedOptions={parseStringsToOptions(tags)}
              onChange={this.onTagsChange}
              onCreateOption={this.onCreateTag}
              noSuggestions={true}
              // isInvalid={isInvalid}
              // data-test-subj={"define-detector-detector-name"}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />
          <EuiButton>Preview alerts</EuiButton>

          <EuiSpacer size={'m'} />
          <EuiTitle>
            <h4>Notify</h4>
          </EuiTitle>
          <EuiSpacer size={'m'} />

          <EuiFormRow
            label={<FormFieldHeader headerTitle={'Select channels to notify'} />}
            // isInvalid={isInvalid}
            // error={isInvalid && this.getErrorMessage()}
          >
            <EuiComboBox
              placeholder={'Select notification channels.'}
              async={true}
              isLoading={loadingNotifications}
              options={parseStringsToOptions(allNotificationChannels)}
              selectedOptions={parseStringsToOptions(notification_channel_ids)}
              onChange={this.onNotificationChannelsChange}
              // isInvalid={isInvalid}
              // data-test-subj={"define-detector-detector-name"}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />
          <EuiSwitch
            label={'Preview message'}
            checked={previewToggle}
            onChange={this.togglePreview}
          />
          <EuiSpacer size={'m'} />

          {/*// TODO: Implement message preview*/}
        </EuiAccordion>
      </EuiPanel>
    );
  }
}
