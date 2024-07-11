/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiComboBox, EuiComboBoxOptionOption, EuiCompressedFormRow } from '@elastic/eui';

interface SIEMFieldNameProps {
  fieldNameOptions: string[];
  selectedField: string;
  onChange: (option: string) => void;
}

interface SIEMFieldNameState {
  selectedOptions: EuiComboBoxOptionOption<string>[];
  errorMessage?: string;
}

export default class FieldNameSelector extends Component<SIEMFieldNameProps, SIEMFieldNameState> {
  constructor(props: SIEMFieldNameProps) {
    super(props);

    const selectedOptions: EuiComboBoxOptionOption<string>[] = props.selectedField
      ? [{ label: props.selectedField }]
      : [];

    this.state = {
      selectedOptions: selectedOptions,
    };
  }

  public componentDidUpdate(
    prevProps: Readonly<SIEMFieldNameProps>,
    prevState: Readonly<SIEMFieldNameState>,
    snapshot?: any
  ): void {
    if (this.props.selectedField !== prevProps.selectedField) {
      // if the props.selectedField is changed, update the state
      this.setState({
        selectedOptions: this.props.selectedField ? [{ label: this.props.selectedField }] : [],
      });
    }
  }

  onMappingChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    this.setState({ selectedOptions });
    this.props.onChange(selectedOptions[0]?.label);
  };

  render() {
    const { selectedOptions } = this.state;
    const { fieldNameOptions } = this.props;

    const comboOptions = fieldNameOptions.map((option) => ({
      label: option,
    }));

    return (
      <EuiCompressedFormRow style={{ width: '100%' }}>
        <EuiComboBox
          data-test-subj={'detector-field-mappings-select'}
          placeholder="Select a mapping field"
          singleSelection={{ asPlainText: true }}
          options={comboOptions}
          selectedOptions={selectedOptions}
          onChange={this.onMappingChange}
        />
      </EuiCompressedFormRow>
    );
  }
}
