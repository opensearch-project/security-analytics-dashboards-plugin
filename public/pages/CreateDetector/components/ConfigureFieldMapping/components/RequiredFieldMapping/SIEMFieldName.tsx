/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiFormRow, EuiSelect } from '@elastic/eui';
import { ChangeEvent } from 'react';

interface SIEMFieldNameProps {
  siemFieldNameOptions: string[];
  logFieldName: string;
  onChange: (option: string) => void;
  createdMappings: { [fieldName: string]: string };
}

interface SIEMFieldNameState {
  selectedOption?: string;
  errorMessage?: string;
}

export default class SIEMFieldNameSelector extends Component<
  SIEMFieldNameProps,
  SIEMFieldNameState
> {
  constructor(props: SIEMFieldNameProps) {
    super(props);
    this.state = {
      selectedOption: undefined,
    };
  }

  /**
   * Returns false if the alias has already been selected for another field.
   */
  validateSelectedAlias(selectedAlias: string) {
    const existingMappings = {
      ...this.props.createdMappings,
    };
    delete existingMappings[this.props.logFieldName];

    return Object.values(existingMappings).indexOf(selectedAlias) === -1;
  }

  onChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    if (!this.validateSelectedAlias(event.target.value)) {
      this.setState({
        selectedOption: event.target.value,
        errorMessage: 'This alias is already in use, pleade select a different alias',
      });
    } else {
      this.props.onChange(event.target.value);
      this.setState({ selectedOption: event.target.value, errorMessage: undefined });
    }
  };

  render() {
    return (
      <EuiFormRow
        style={{ width: '100%' }}
        isInvalid={!!this.state.errorMessage}
        error={this.state.errorMessage}
      >
        <EuiSelect
          required={true}
          hasNoInitialSelection
          options={this.props.siemFieldNameOptions.map((option) => ({
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
