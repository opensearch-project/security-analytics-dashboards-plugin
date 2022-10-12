/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiComboBox, EuiFormRow } from '@elastic/eui';

interface SIEMFieldNameProps extends RouteComponentProps {
  siemFieldName: string;
}

interface SIEMFieldNameState {}

export default class SIEMFieldName extends Component<SIEMFieldNameProps, SIEMFieldNameState> {
  constructor(props: SIEMFieldNameProps) {
    super(props);
    this.state = {
      fieldTouched: false,
      loading: false,
      options: [],
    };
  }

  componentDidMount = async () => {};

  getFieldNames = async () => {
    this.setState({ loading: true });
    this.setState({ loading: false });
  };

  onChange = () => {
    this.setState({ fieldTouched: true });
  };

  parseSIEMFieldNameOptions = (fieldNames: string[]) => {
    return fieldNames.map((fieldName) => ({ label: fieldName }));
  };

  isInvalid = () => {
    const { fieldTouched, selectedField } = this.props;
    return fieldTouched && selectedField.length < 1;
  };

  getErrorMessage = () => {
    return 'Select an SIEM field name.';
  };

  render() {
    const { siemFieldName } = this.props;
    const { fieldTouched, loading, options } = this.state;

    return (
      <EuiFormRow
        style={{ width: '100%' }}
        // isInvalid={isInvalid}
        // error={isInvalid && this.getErrorMessage()}
      >
        <EuiComboBox
          placeholder={'Select an SIEM field name.'}
          async={true}
          fullWidth={true}
          isLoading={loading}
          options={options}
          selectedOptions={this.parseSIEMFieldNameOptions([siemFieldName])}
          onChange={this.onChange}
          singleSelection={{ asPlainText: true }}
          isClearable={false}
          // isInvalid={hasSubmitted && detectorIndices.length < MIN_NUM_DATA_SOURCES}
          // data-test-subj={"siem-field-name-selection"} // TODO: Need to think of a way to make this predictably unique
        />
      </EuiFormRow>
    );
  }
}
