/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import {
  EuiCompressedFormRow,
  EuiSpacer,
  EuiCompressedComboBox,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import {
  CreateDetectorRulesState,
  DetectionRules,
} from '../../../../../CreateDetector/components/DefineDetector/components/DetectionRules/DetectionRules';
import { RuleItem } from '../../../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import ConfigureFieldMapping from '../../../../../CreateDetector/components/ConfigureFieldMapping';
import { ConfigureFieldMappingProps } from '../../../../../CreateDetector/components/ConfigureFieldMapping/containers/ConfigureFieldMapping';
import { getIntegrationOptionsBySpace } from '../../../../../../utils/helpers';
import { getLogTypeLabel } from '../../../../../LogTypes/utils/helpers';
import { SpaceSelector } from '../../../../../../components/SpaceSelector/SpaceSelector';
import { SpaceTypes } from '../../../../../../../common/constants';

interface DetectorTypeProps {
  detectorType: string;
  rulesState: CreateDetectorRulesState;
  configureFieldMappingProps: ConfigureFieldMappingProps;
  loadingRules?: boolean;
  onDetectorTypeChange: (detectorType: string) => void;
  onPageChange: (page: { index: number; size: number }) => void;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
  /** Notifies the parent when the selected space changes so it can re-filter rules */
  onSpaceChange?: (space: string) => void;
}

interface DetectorTypeState {
  fieldTouched: boolean;
  selectedSpace: string;
  detectorTypeOptions: { value: string; label: string }[];
}

export default class DetectorType extends Component<DetectorTypeProps, DetectorTypeState> {
  constructor(props: DetectorTypeProps) {
    super(props);

    this.state = {
      fieldTouched: false,
      selectedSpace: SpaceTypes.STANDARD.value,
      detectorTypeOptions: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.loadOptionsForSpace(this.state.selectedSpace);
  }

  private async loadOptionsForSpace(space: string): Promise<void> {
    const options = await getIntegrationOptionsBySpace(space);
    this.setState({ detectorTypeOptions: options });
  }

  onSpaceChange = async (space: string): Promise<void> => {
    this.setState({ selectedSpace: space });
    // Clear the currently selected integration when switching spaces
    this.props.onDetectorTypeChange('');
    // Notify parent so it can re-fetch rules filtered by the new space
    this.props.onSpaceChange?.(space);
    await this.loadOptionsForSpace(space);
  };

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
    const { detectorTypeOptions } = this.state;
    if (detectorType.length < 1) return 'Select a detector type.';
    // Validate against the currently loaded options for the selected space
    if (
      detectorTypeOptions.length > 0 &&
      !detectorTypeOptions.some((opt) => opt.value === detectorType)
    ) {
      return 'Unsupported detector type.';
    }
    return '';
  };

  render() {
    const { detectorType } = this.props;
    const { selectedSpace, detectorTypeOptions } = this.state;

    return (
      <>
        <EuiText size="s">
          <h3>Rules</h3>
        </EuiText>
        <EuiText size="s">
          <p>
            The rules are automatically populated based on your selected integration. Threat
            intelligence based detection can be enabled for standard integrations.{' '}
          </p>
        </EuiText>
        <EuiSpacer />

        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <SpaceSelector
              selectedSpace={selectedSpace}
              onSpaceChange={this.onSpaceChange}
              allowedSpaces={[SpaceTypes.STANDARD.value, SpaceTypes.CUSTOM.value]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="m" />

        <EuiCompressedFormRow
          label={
            <div>
              {/* Replace log type with integration by Wazuh */}
              <FormFieldHeader headerTitle={'Integration'} />
              <EuiSpacer size={'s'} />
            </div>
          }
          fullWidth={true}
          isInvalid={this.isInvalid()}
          error={this.getErrorMessage()}
        >
          <EuiCompressedComboBox
            isInvalid={this.isInvalid()}
            placeholder="Select integration" // Changed Log Type to Integration by Wazuh
            data-test-subj={'log_type_dropdown'}
            options={detectorTypeOptions}
            singleSelection={{ asPlainText: true }}
            onChange={(e) => {
              this.onChange(e[0]?.value || '');
            }}
            selectedOptions={
              detectorType
                ? [
                    {
                      value: detectorType,
                      label: getLogTypeLabel(detectorType),
                    },
                  ]
                : []
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

        {/* <EuiCompressedFormRow fullWidth={true}>
          <ConfigureFieldMapping {...this.props.configureFieldMappingProps} />
        </EuiCompressedFormRow> */}
      </>
    );
  }
}
