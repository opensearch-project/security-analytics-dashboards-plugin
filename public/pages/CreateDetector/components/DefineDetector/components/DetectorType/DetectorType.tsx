/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiFormRow, EuiFlexGrid, EuiFlexItem, EuiRadio, EuiSpacer } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { DETECTOR_TYPES } from '../../../../../Detectors/utils/constants';
import { DetectorTypeOption } from '../../../../../Detectors/models/interfaces';
import { CreateDetectorRulesState, DetectionRules } from '../DetectionRules/DetectionRules';
import { RuleItem } from '../DetectionRules/types/interfaces';

interface DetectorTypeProps {
  detectorType: string;
  onDetectorTypeChange: (detectorType: string) => void;
  rulesState: CreateDetectorRulesState;
  loadingRules?: boolean;
  onPageChange: (page: { index: number; size: number }) => void;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
}

interface DetectorTypeState {
  fieldTouched: boolean;
  detectorTypeOptions: DetectorTypeOption[];
  detectorTypeIds: string[];
}

export default class DetectorType extends Component<DetectorTypeProps, DetectorTypeState> {
  constructor(props: DetectorTypeProps) {
    super(props);

    const detectorTypeOptions = Object.values(DETECTOR_TYPES);
    const detectorTypeIds = detectorTypeOptions.map((option) => option.id);
    this.state = {
      fieldTouched: false,
      detectorTypeOptions,
      detectorTypeIds,
    };
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
    const { detectorTypeOptions } = this.state;
    const radioButtons = detectorTypeOptions.map((type) => (
      <EuiFlexItem key={type.id}>
        <EuiRadio
          id={type.id}
          label={type.label}
          checked={type.id === detectorType}
          onChange={() => this.onChange(type.id)}
        />
      </EuiFlexItem>
    ));

    return (
      <ContentPanel
        title={'Log types and rules'}
        titleSize={'m'}
        subTitleText="Choose the log types that correspond to your data source. Detection rules are automatically added based on your chosen log types."
      >
        <EuiFormRow
          label={
            <div>
              <FormFieldHeader headerTitle={'Select a category type you would like to detect'} />
              <EuiSpacer size={'s'} />
            </div>
          }
          fullWidth={true}
          isInvalid={this.isInvalid()}
          error={this.getErrorMessage()}
        >
          <EuiFlexGrid columns={4}>{radioButtons}</EuiFlexGrid>
        </EuiFormRow>

        <EuiFormRow fullWidth={true}>
          <DetectionRules
            rulesState={this.props.rulesState}
            loading={this.props.loadingRules}
            onPageChange={this.props.onPageChange}
            onRuleToggle={this.props.onRuleToggle}
            onAllRulesToggle={this.props.onAllRulesToggle}
          />
        </EuiFormRow>
      </ContentPanel>
    );
  }
}
