/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiFormRow, EuiSelect } from '@elastic/eui';
import { ChangeEvent } from 'react';

interface SIEMFieldNameProps {
  siemFieldNameOptions: string[];
  onChange: (option: string) => void;
}

interface SIEMFieldNameState {
  options: { value: string; text: string }[];
  selectedOption?: string;
}

export default class SIEMFieldName extends Component<SIEMFieldNameProps, SIEMFieldNameState> {
  constructor(props: SIEMFieldNameProps) {
    super(props);
    this.state = {
      options: props.siemFieldNameOptions.map((option) => ({ value: option, text: option })),
      selectedOption: undefined,
    };
  }

  onChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    this.props.onChange(event.target.value);
    this.setState({ selectedOption: event.target.value });
  };

  render() {
    return (
      <EuiFormRow style={{ width: '100%' }}>
        <EuiSelect
          required={true}
          hasNoInitialSelection
          options={this.state.options}
          value={this.state.selectedOption}
          onChange={this.onChange}
        />
      </EuiFormRow>
    );
  }
}
