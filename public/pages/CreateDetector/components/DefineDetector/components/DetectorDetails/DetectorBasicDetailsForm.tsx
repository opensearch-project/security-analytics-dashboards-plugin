/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiFormRow, EuiFieldText, EuiSpacer, EuiTextArea } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';

// TODO: Implement regex pattern to validate name and description strings

interface DetectorDetailsProps extends RouteComponentProps {
  hasSubmitted: boolean;
  detectorName: string;
  detectorDescription: string;
  onDetectorNameChange: (value: ChangeEvent<HTMLInputElement>) => void;
  onDetectorInputDescriptionChange: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

interface DetectorDetailsState {}

export default class DetectorBasicDetailsForm extends Component<
  DetectorDetailsProps,
  DetectorDetailsState
> {
  constructor(props: DetectorDetailsProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      detectorName,
      detectorDescription,
      onDetectorNameChange,
      onDetectorInputDescriptionChange,
    } = this.props;
    return (
      <ContentPanel title={'Threat detector details'} titleSize={'m'}>
        <EuiSpacer size={'m'} />
        <EuiFormRow label={<FormFieldHeader headerTitle={'Name'} />}>
          <EuiFieldText
            placeholder={'Enter a name for the detector.'}
            readOnly={false}
            value={detectorName}
            onChange={onDetectorNameChange}
            data-test-subj={'define-detector-detector-name'}
            required={true}
          />
        </EuiFormRow>
        <EuiSpacer size={'m'} />
        <EuiFormRow label={<FormFieldHeader headerTitle={'Description'} optionalField={true} />}>
          <EuiTextArea
            placeholder={'Enter a description for the detector.'}
            compressed={true}
            value={detectorDescription}
            onChange={onDetectorInputDescriptionChange}
            data-test-subj={'define-detector-detector-description'}
          />
        </EuiFormRow>
      </ContentPanel>
    );
  }
}
