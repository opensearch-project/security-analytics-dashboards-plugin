/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiFormRow, EuiFlexGrid, EuiFlexItem, EuiRadio, EuiSpacer } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { RuleCategory } from '../../../../../../../server/models/interfaces';

interface DetectorTypeProps {
  detectorType: string;
  allRuleCategories: RuleCategory[];
  onDetectorTypeChange: (detectorType: string) => void;
}

interface DetectorTypeState {
  fieldTouched: boolean;
  detectorTypeIds: string[];
}

export default class DetectorType extends Component<DetectorTypeProps, DetectorTypeState> {
  constructor(props: DetectorTypeProps) {
    super(props);

    this.state = {
      fieldTouched: false,
      detectorTypeIds: [],
    };
  }

  componentDidMount(): void {
    const detectorTypeIds = this.props.allRuleCategories.map((option) => option.key);
    this.setState({ detectorTypeIds });
  }

  componentDidUpdate(
    prevProps: Readonly<DetectorTypeProps>,
    prevState: Readonly<DetectorTypeState>,
    snapshot?: any
  ): void {
    if (prevProps.allRuleCategories !== this.props.allRuleCategories) {
      const detectorTypeIds = this.props.allRuleCategories.map((option) => option.key);
      this.setState({ detectorTypeIds });
    }
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
      return 'Unsupported detector type.';
    }
    return '';
  };

  render() {
    const { detectorType, allRuleCategories } = this.props;
    const radioButtons = allRuleCategories.map((category) => (
      <EuiFlexItem key={category.key}>
        <EuiRadio
          id={category.key}
          label={category.display_name}
          checked={category.key === detectorType}
          onChange={() => this.onChange(category.key)}
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
      </ContentPanel>
    );
  }
}
