/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiCompressedFormRow, EuiFieldText, EuiSpacer, EuiTextArea, EuiTitle } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import {
  getDescriptionErrorMessage,
  getNameErrorMessage,
  validateDescription,
  validateName,
} from '../../../../../../utils/validation';

interface DetectorDetailsProps {
  isEdit: boolean;
  detectorName: string;
  detectorDescription: string;
  onDetectorNameChange: (name: string) => void;
  onDetectorInputDescriptionChange: (value: string) => void;
}

interface DetectorDetailsState {
  nameIsInvalid: boolean;
  nameFieldTouched: boolean;
  descriptionIsInvalid: boolean;
  descriptionFieldTouched: boolean;
}

export default class DetectorBasicDetailsForm extends Component<
  DetectorDetailsProps,
  DetectorDetailsState
> {
  constructor(props: DetectorDetailsProps) {
    super(props);
    this.state = {
      nameIsInvalid: false,
      nameFieldTouched: props.isEdit,
      descriptionIsInvalid: false,
      descriptionFieldTouched: props.isEdit,
    };
  }

  onNameBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      nameFieldTouched: true,
      nameIsInvalid: !validateName(event.target.value),
    });
  };

  onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onDetectorNameChange(event.target.value.trimStart());
  };

  onDescriptionBlur = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      descriptionFieldTouched: true,
      descriptionIsInvalid: !validateDescription(event.target.value),
    });
  };

  onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onDetectorInputDescriptionChange(event.target.value.trimStart());
  };

  render() {
    const { detectorName, detectorDescription } = this.props;
    const {
      descriptionIsInvalid,
      descriptionFieldTouched,
      nameIsInvalid,
      nameFieldTouched,
    } = this.state;
    return (
      <>
        <EuiTitle size="m">
          <h3>Detector details</h3>
        </EuiTitle>
        <EuiSpacer size={'m'} />
        <EuiCompressedFormRow
          label={<FormFieldHeader headerTitle={'Name'} />}
          isInvalid={nameFieldTouched && nameIsInvalid}
          error={getNameErrorMessage(detectorName, nameIsInvalid, nameFieldTouched)}
        >
          <EuiFieldText
            placeholder={'Enter a name for the detector.'}
            readOnly={false}
            value={detectorName}
            onBlur={this.onNameBlur}
            onChange={this.onNameChange}
            required={nameFieldTouched}
            data-test-subj={'define-detector-detector-name'}
          />
        </EuiCompressedFormRow>
        <EuiSpacer size={'m'} />

        <EuiCompressedFormRow
          label={<FormFieldHeader headerTitle={'Description'} optionalField={true} />}
          isInvalid={descriptionFieldTouched && descriptionIsInvalid}
          error={getDescriptionErrorMessage(
            detectorDescription,
            descriptionIsInvalid,
            descriptionFieldTouched
          )}
        >
          <EuiTextArea
            placeholder={'Enter a description for the detector.'}
            compressed={true}
            value={detectorDescription}
            onBlur={this.onDescriptionBlur}
            onChange={this.onDescriptionChange}
            data-test-subj={'define-detector-detector-description'}
          />
        </EuiCompressedFormRow>
      </>
    );
  }
}
