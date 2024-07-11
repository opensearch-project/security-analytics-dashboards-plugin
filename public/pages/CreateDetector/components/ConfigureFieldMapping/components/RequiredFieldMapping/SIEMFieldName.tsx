/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiCompressedFormRow, EuiCompressedSelect } from '@elastic/eui';
import { ChangeEvent } from 'react';

interface SIEMFieldNameProps {
  siemFieldNameOptions: string[];
  isInvalid: boolean;
  selectedAlias: string;
  onChange: (option: string) => void;
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
      selectedOption: props.selectedAlias,
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
      <EuiCompressedFormRow
        style={{ width: '100%' }}
        isInvalid={isInvalid}
        error={isInvalid ? 'Alias already used' : undefined}
      >
        <EuiCompressedSelect
          required={true}
          hasNoInitialSelection
          options={this.props.siemFieldNameOptions.map((option) => ({
            value: option,
            text: option,
          }))}
          value={this.state.selectedOption}
          onChange={this.onChange}
        />
      </EuiCompressedFormRow>
    );
  }
}
