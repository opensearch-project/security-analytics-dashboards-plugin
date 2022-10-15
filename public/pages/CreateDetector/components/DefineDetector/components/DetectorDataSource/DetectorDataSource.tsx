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

interface DetectorDataSourceProps extends RouteComponentProps {
  hasSubmitted: boolean;
  detectorIndices: string[];
  onDetectorInputIndicesChange: (selectedOptions: EuiComboBoxOptionOption<string>[]) => void;
}

interface DetectorDataSourceState {
  loading: boolean;
  indexOptions: IndexOption[];
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
    // TODO: Delete after testing
    const exampleIndices = [
      'index-1',
      'index-2',
      'index-3',
      'index-4',
      'index-5',
      'index-6',
      'index-7',
      'index-8',
      'index-9',
      'index-10',
    ];

    this.setState({
      loading: false,
      indexOptions: this.parseOptions(exampleIndices),
    });
  };

  parseOptions = (indices: string[]) => {
    return indices.map((index) => ({ label: index }));
  };

  isInvalid = () => {
    const { hasSubmitted, detectorIndices } = this.props;
    return hasSubmitted && detectorIndices.length < MIN_NUM_DATA_SOURCES;
  };

  getErrorMessage = () => {
    return 'Enter a name for the detector.';
  };

  render() {
    const { detectorIndices, onDetectorInputIndicesChange } = this.props;
    const { loading, indexOptions } = this.state;
    const isInvalid = this.isInvalid();
    return (
      <ContentPanel title={'Threat detector details'} titleSize={'m'}>
        <EuiSpacer size={'m'} />
        <EuiFormRow
          label={
            <FormFieldHeader headerTitle={'Select or input source indexes or index patterns'} />
          }
          isInvalid={isInvalid}
          error={isInvalid && this.getErrorMessage()}
        >
          <EuiComboBox
            placeholder={'Select an input source for the detector.'}
            async={true}
            isLoading={loading}
            options={indexOptions}
            selectedOptions={this.parseOptions(detectorIndices)}
            onChange={onDetectorInputIndicesChange}
            isInvalid={isInvalid}
            data-test-subj={'define-detector-detector-name'}
          />
        </EuiFormRow>
      </ContentPanel>
    );
  }
}
