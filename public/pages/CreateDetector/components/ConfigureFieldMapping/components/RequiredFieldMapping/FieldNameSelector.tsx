/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiFormRow, EuiSelect } from '@elastic/eui';
import { ChangeEvent } from 'react';

interface SIEMFieldNameProps {
  fieldNameOptions: string[];
  isInvalid: boolean;
  selectedField: string;
  onChange: (option: string) => void;
}

interface SIEMFieldNameState {
  selectedOption?: string;
  errorMessage?: string;
}

export default class FieldNameSelector extends Component<SIEMFieldNameProps, SIEMFieldNameState> {
  constructor(props: SIEMFieldNameProps) {
    super(props);
    this.state = {
      selectedOption: props.selectedField,
    };
  }

  onChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    this.setState({ selectedOption: event.target.value });
    this.props.onChange(event.target.value);
  };

  render() {
    const { isInvalid } = this.props;
    return (
      <EuiFormRow
        style={{ width: '100%' }}
        isInvalid={isInvalid}
        error={isInvalid ? 'Name already used' : undefined}
      >
        <EuiSelect
          required={true}
          hasNoInitialSelection
          options={this.props.fieldNameOptions.map((option) => ({
            value: option,
            text: option,
          }))}
          value={this.state.selectedOption}
          onChange={this.onChange}
        />
      </EuiFormRow>
    );
  }
}
