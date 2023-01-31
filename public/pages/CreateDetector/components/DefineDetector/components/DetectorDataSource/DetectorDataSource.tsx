/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiComboBox, EuiComboBoxOptionOption, EuiFormRow, EuiSpacer } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { IndexOption } from '../../../../../Detectors/models/interfaces';
import { MIN_NUM_DATA_SOURCES } from '../../../../../Detectors/utils/constants';
import IndexService from '../../../../../../services/IndexService';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../../../../utils/helpers';

interface DetectorDataSourceProps {
  detectorIndices: string[];
  indexService: IndexService;
  isEdit: boolean;
  onDetectorInputIndicesChange: (selectedOptions: EuiComboBoxOptionOption<string>[]) => void;
  notifications: NotificationsStart;
}

interface DetectorDataSourceState {
  loading: boolean;
  fieldTouched: boolean;
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
      fieldTouched: props.isEdit,
      indexOptions: [],
    };
  }

  componentDidMount = async () => {
    this.getIndices();
  };

  getIndices = async () => {
    this.setState({ loading: true });
    try {
      const indicesResponse = await this.props.indexService.getIndices();
      if (indicesResponse.ok) {
        const indices = indicesResponse.response.indices;
        const indicesNames = indices.map((index) => index.index);

        this.setState({
          loading: false,
          indexOptions: this.parseOptions(indicesNames),
        });
      } else {
        errorNotificationToast(
          this.props.notifications,
          'retrieve',
          'indices',
          indicesResponse.error
        );
        this.setState({ errorMessage: indicesResponse.error });
      }
    } catch (error: any) {
      errorNotificationToast(this.props.notifications, 'retrieve', 'indices', error);
    }
    this.setState({ loading: false });
  };

  parseOptions = (indices: string[]) => {
    return indices.map((index) => ({ label: index }));
  };

  onCreateOption = (searchValue: string, options: EuiComboBoxOptionOption[]) => {
    const parsedOptions = this.parseOptions(this.props.detectorIndices);
    parsedOptions.push({ label: searchValue });
    this.onSelectionChange(parsedOptions);
  };

  onSelectionChange = (options: EuiComboBoxOptionOption<string>[]) => {
    this.props.onDetectorInputIndicesChange(options);
  };

  render() {
    const { detectorIndices } = this.props;
    const { loading, fieldTouched, indexOptions, errorMessage } = this.state;
    const isInvalid = fieldTouched && detectorIndices.length < MIN_NUM_DATA_SOURCES;
    return (
      <ContentPanel title={'Data source'} titleSize={'m'}>
        <EuiSpacer size={'m'} />
        <EuiFormRow
          label={
            <FormFieldHeader headerTitle={'Select or input source indexes or index patterns'} />
          }
          isInvalid={isInvalid}
          error={isInvalid && (errorMessage || 'Select an input source.')}
        >
          <EuiComboBox
            singleSelection={{ asPlainText: true }}
            placeholder={'Select an input source for the detector.'}
            isLoading={loading}
            options={indexOptions}
            selectedOptions={this.parseOptions(detectorIndices)}
            onBlur={() => this.setState({ fieldTouched: true })}
            onChange={this.onSelectionChange}
            onCreateOption={this.onCreateOption}
            isInvalid={!!errorMessage}
            data-test-subj={'define-detector-select-data-source'}
          />
        </EuiFormRow>
      </ContentPanel>
    );
  }
}
