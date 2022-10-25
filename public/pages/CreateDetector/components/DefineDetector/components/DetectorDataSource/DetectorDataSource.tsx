/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiComboBox, EuiComboBoxOptionOption, EuiFormRow, EuiSpacer } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { IndexOption } from '../../../../../Detectors/models/interfaces';
import { MIN_NUM_DATA_SOURCES } from '../../../../../Detectors/utils/constants';
import IndexService from '../../../../../../services/IndexService';

interface DetectorDataSourceProps extends RouteComponentProps {
  detectorIndices: string[];
  indexService: IndexService;
  onDetectorInputIndicesChange: (selectedOptions: EuiComboBoxOptionOption<string>[]) => void;
}

interface DetectorDataSourceState {
  loading: boolean;
  indexOptions: IndexOption[];
  errorMessage?: string;
}

export default class DetectorDataSource extends Component<
  DetectorDataSourceProps,
  DetectorDataSourceState
> {
  constructor(props: DetectorDataSourceProps) {
    super(props);
    this.state = {
      loading: true,
      indexOptions: [],
    };
  }

  componentDidMount = async () => {
    this.getIndices();
  };

  getIndices = async () => {
    this.setState({ loading: true });
    const indicesResponse = await this.props.indexService.getIndices();

    if (indicesResponse.ok) {
      const indices = indicesResponse.response.indices;
      const indicesNames = indices.map((index) => index.index);

      this.setState({
        loading: false,
        indexOptions: this.parseOptions(indicesNames),
      });
    } else {
      this.setState({
        loading: false,
        errorMessage: indicesResponse.error,
      });
    }
  };

  parseOptions = (indices: string[]) => {
    return indices.map((index) => ({ label: index }));
  };

  onSelectionChange = (options: EuiComboBoxOptionOption<string>[]) => {
    if (options.length < MIN_NUM_DATA_SOURCES) {
      this.setState({ errorMessage: 'Select an input source.' });
    } else {
      this.setState({ errorMessage: undefined });
    }

    this.props.onDetectorInputIndicesChange(options);
  };

  render() {
    const { detectorIndices } = this.props;
    const { loading, indexOptions, errorMessage } = this.state;

    return (
      <ContentPanel title={'Threat detector details'} titleSize={'m'}>
        <EuiSpacer size={'m'} />
        <EuiFormRow
          label={
            <FormFieldHeader headerTitle={'Select or input source indexes or index patterns'} />
          }
          isInvalid={!!errorMessage}
          error={errorMessage}
        >
          <EuiComboBox
            placeholder={'Select an input source for the detector.'}
            async={true}
            isLoading={loading}
            options={indexOptions}
            selectedOptions={this.parseOptions(detectorIndices)}
            onChange={this.onSelectionChange}
            isInvalid={!!errorMessage}
            singleSelection={true}
            data-test-subj={'define-detector-detector-name'}
          />
        </EuiFormRow>
      </ContentPanel>
    );
  }
}
