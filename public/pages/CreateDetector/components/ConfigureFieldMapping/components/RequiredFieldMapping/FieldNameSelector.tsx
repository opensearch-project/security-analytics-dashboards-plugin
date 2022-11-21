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
  selectedOptions: EuiComboBoxOptionOption<string>[];
  errorMessage?: string;
}

export default class FieldNameSelector extends Component<SIEMFieldNameProps, SIEMFieldNameState> {
  constructor(props: SIEMFieldNameProps) {
    super(props);

    let selectedOptions = [] as EuiComboBoxOptionOption<string>[];
    if (props.selectedField) {
      selectedOptions = [
        {
          label: props.selectedField,
        },
      ];
    }

    this.state = {
      selectedOptions: selectedOptions,
    };
  }

  onMappingChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    if (!selectedOptions.length) selectedOptions = [...this.state.selectedOptions];
    this.setState({ selectedOptions });
    this.props.onChange(selectedOptions[0]?.label);
  };

  render() {
    const { selectedOptions } = this.state;
    const { isInvalid, fieldNameOptions } = this.props;

    const comboOptions = fieldNameOptions.map((option) => ({
      value: option,
      label: option,
    }));

    return (
      <EuiFormRow
        style={{ width: '100%' }}
        isInvalid={isInvalid}
        error={isInvalid ? 'Name already used' : undefined}
      >
        <EuiComboBox
          data-test-subj={'detector-field-mappings-select'}
          placeholder="Select a mapping field"
          singleSelection={{ asPlainText: true }}
          options={comboOptions}
          selectedOptions={selectedOptions}
          isClearable={false}
          onChange={this.onMappingChange}
        />
      </EuiFormRow>
    );
  }
}
