/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiCompressedFormRow, EuiSpacer, EuiComboBox, EuiTitle, EuiText } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { CreateDetectorRulesState, DetectionRules } from '../DetectionRules/DetectionRules';
import { RuleItem } from '../DetectionRules/types/interfaces';
import { ruleTypes } from '../../../../../Rules/utils/constants';
import ConfigureFieldMapping from '../../../ConfigureFieldMapping';
import { ConfigureFieldMappingProps } from '../../../ConfigureFieldMapping/containers/ConfigureFieldMapping';
import { getLogTypeOptions } from '../../../../../../utils/helpers';
import { getLogTypeLabel } from '../../../../../LogTypes/utils/helpers';

interface DetectorTypeProps {
  detectorType: string;
  rulesState: CreateDetectorRulesState;
  configureFieldMappingProps: ConfigureFieldMappingProps;
  loadingRules?: boolean;
  onDetectorTypeChange: (detectorType: string) => void;
  onPageChange: (page: { index: number; size: number }) => void;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
}

interface DetectorTypeState {
  fieldTouched: boolean;
  detectorTypeIds: string[];
}

export default class DetectorType extends Component<DetectorTypeProps, DetectorTypeState> {
  private detectorTypeOptions: { value: string; label: string }[] = [];
  constructor(props: DetectorTypeProps) {
    super(props);

    this.state = {
      fieldTouched: false,
      detectorTypeIds: [],
    };
  }

  async componentDidMount(): Promise<void> {
    this.detectorTypeOptions = await getLogTypeOptions();
    this.setState({
      detectorTypeIds: ruleTypes.map((option) => option.value),
    });
  }

  onChange = (detectorType: string) => {
    this.setState({ fieldTouched: true });
    this.props.onDetectorTypeChange(detectorType);
  };

  isInvalid = () => {
    const { fieldTouched } = this.state;
    return fieldTouched && !(this.getErrorMessage().length < 1);
  };

  getErrorMessage = () => {
    const { detectorType } = this.props;
    if (detectorType.length < 1) return 'Select a detector type.';
    if (!this.state.detectorTypeIds.includes(detectorType)) {
      console.warn(`Unsupported detector type found: ${detectorType}`);
      return 'Unsupported detector type.';
    }
    return '';
  };

  render() {
    const { detectorType } = this.props;

    return (
      <>
        <EuiTitle size="m">
          <h3>Detection rules</h3>
        </EuiTitle>
        <EuiText>
          <p>
            The detection rules are automatically populated based on your selected log type. Threat
            intelligence based detection can be enabled for standard log types.{' '}
          </p>
        </EuiText>
        <EuiSpacer />
        <EuiCompressedFormRow
          label={
            <div>
              <FormFieldHeader headerTitle={'Log type'} />
              <EuiSpacer size={'s'} />
            </div>
          }
          fullWidth={true}
          isInvalid={this.isInvalid()}
          error={this.getErrorMessage()}
        >
          <EuiComboBox
            isInvalid={this.isInvalid()}
            placeholder="Select log type"
            data-test-subj={'log_type_dropdown'}
            options={this.detectorTypeOptions}
            singleSelection={{ asPlainText: true }}
            onChange={(e) => {
              this.onChange(e[0]?.value || '');
            }}
            selectedOptions={
              detectorType ? [{ value: detectorType, label: getLogTypeLabel(detectorType) }] : []
            }
          />
        </EuiCompressedFormRow>

        <EuiCompressedFormRow fullWidth={true}>
          <DetectionRules
            detectorType={detectorType}
            rulesState={this.props.rulesState}
            loading={this.props.loadingRules}
            onPageChange={this.props.onPageChange}
            onRuleToggle={this.props.onRuleToggle}
            onAllRulesToggle={this.props.onAllRulesToggle}
          />
        </EuiCompressedFormRow>

        <EuiCompressedFormRow fullWidth={true}>
          <ConfigureFieldMapping {...this.props.configureFieldMappingProps} />
        </EuiCompressedFormRow>
      </>
    );
  }
}
