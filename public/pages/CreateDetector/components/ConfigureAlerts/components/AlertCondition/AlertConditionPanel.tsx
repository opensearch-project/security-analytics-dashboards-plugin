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
  EuiFormRow,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
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

  onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    triggers.splice(indexNum, 1, { ...alertCondition, name: name });
    changeDetector({ ...detector, triggers });
  };

  onSeverityChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const severitySelections = selectedOptions.map((option) => option.label);
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    triggers.splice(indexNum, 1, { ...alertCondition, sev_levels: severitySelections });
    changeDetector({ ...detector, triggers: triggers });
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
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    triggers.splice(indexNum, 1, { ...alertCondition, tags: tags });
    changeDetector({ ...detector, triggers: triggers });
  };

  onNotificationChannelsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    // const channelIds = selectedOptions.map((channel) => channel.label);
    const {
      alertCondition,
      changeDetector,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    triggers.splice(indexNum, 1, {
      ...alertCondition,
    });
    changeDetector({ ...detector, triggers: triggers });
  };

  onDelete = () => {
    const {
      changeDetector,
      detector,
      detector: { triggers },
      indexNum,
    } = this.props;
    delete triggers[indexNum];
    changeDetector({ ...detector, triggers: triggers });
  };

  render() {
    const {
      alertCondition,
      allNotificationChannels,
      indexNum,
      isEdit,
      loadingNotifications,
    } = this.props;
    const { name, sev_levels: severity } = alertCondition;
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

          <EuiFormRow label={<FormFieldHeader headerTitle={'Name'} />}>
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

          <EuiFormRow label={<FormFieldHeader headerTitle={'Severity levels'} />}>
            <EuiComboBox
              placeholder={'Select applicable severity levels.'}
              async={true}
              options={Object.values(SEVERITY_OPTIONS)}
              selectedOptions={parseSeverityListToOptions(severity)}
              onChange={this.onSeverityChange}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />

          {/*// TODO: Are tags configured by the user, or returned by an API?*/}
          <EuiFormRow label={<FormFieldHeader headerTitle={'Tags'} />}>
            <EuiComboBox
              placeholder={'Enter tags for the alert condition.'}
              options={Object.values(SEVERITY_OPTIONS)}
              onChange={this.onTagsChange}
              onCreateOption={this.onCreateTag}
              noSuggestions={true}
            />
          </EuiFormRow>

          <EuiSpacer size={'m'} />
          <EuiButton>Preview alerts</EuiButton>

          <EuiSpacer size={'m'} />
          <EuiTitle>
            <h4>Notify</h4>
          </EuiTitle>
          <EuiSpacer size={'m'} />

          <EuiFormRow label={<FormFieldHeader headerTitle={'Select channels to notify'} />}>
            <EuiComboBox
              placeholder={'Select notification channels.'}
              async={true}
              isLoading={loadingNotifications}
              options={parseStringsToOptions(allNotificationChannels)}
              onChange={this.onNotificationChannelsChange}
            />
          </EuiFormRow>
          <EuiSpacer size={'m'} />
        </EuiAccordion>
      </EuiPanel>
    );
  }
}
