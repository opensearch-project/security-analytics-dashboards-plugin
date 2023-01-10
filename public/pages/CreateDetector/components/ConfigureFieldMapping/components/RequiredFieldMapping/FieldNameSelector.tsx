/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiComboBox, EuiComboBoxOptionOption, EuiFormRow } from '@elastic/eui';

interface SIEMFieldNameProps {
  fieldNameOptions: string[];
  isInvalid: boolean;
  selectedField: string;
  onChange: (option: string) => void;
}

interface SIEMFieldNameState {
  selectedOptions: EuiComboBoxOptionOption<string>[] | undefined;
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

  onMappingChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    this.setState({ selectedOptions: selectedOptions.length ? selectedOptions : undefined });
    this.props.onChange(selectedOptions[0]?.label);
  };

  render() {
    const { selectedOptions } = this.state;
    const { isInvalid, fieldNameOptions } = this.props;

    const comboOptions = fieldNameOptions.map((option) => ({
      label: option,
    }));

    return (
      <EuiFormRow
        style={{ width: '100%' }}
        isInvalid={isInvalid}
        error={isInvalid ? 'Field already used.' : undefined}
      >
        <EuiComboBox
          data-test-subj={'detector-field-mappings-select'}
          placeholder="Select a mapping field"
          singleSelection={{ asPlainText: true }}
          options={comboOptions}
          selectedOptions={selectedOptions}
          onChange={this.onMappingChange}
        />
      </EuiFormRow>
    );
  }
}
