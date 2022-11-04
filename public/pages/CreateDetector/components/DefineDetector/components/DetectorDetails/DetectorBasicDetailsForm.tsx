/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiFormRow, EuiFieldText, EuiSpacer, EuiTextArea } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';
import { getNameErrorMessage, validateName } from '../../../../../../utils/validation';

interface DetectorDetailsProps {
  isEdit: boolean;
  detectorName: string;
  detectorDescription: string;
  onDetectorNameChange: (name: string) => void;
  onDetectorInputDescriptionChange: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

interface DetectorDetailsState {
  nameIsInvalid: boolean;
  nameFieldTouched: boolean;
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
    };
  }

  onBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      nameFieldTouched: true,
      nameIsInvalid: !validateName(event.target.value),
    });
  };

  onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onDetectorNameChange(event.target.value.trimStart());
  };

  render() {
    const { detectorName, detectorDescription, onDetectorInputDescriptionChange } = this.props;
    const { nameIsInvalid, nameFieldTouched } = this.state;
    return (
      <ContentPanel title={'Detector details'} titleSize={'m'}>
        <EuiSpacer size={'m'} />
        <EuiFormRow
          label={<FormFieldHeader headerTitle={'Name'} />}
          isInvalid={nameIsInvalid && nameFieldTouched}
          error={getNameErrorMessage(detectorName, nameIsInvalid, nameFieldTouched)}
        >
          <EuiFieldText
            placeholder={'Enter a name for the detector.'}
            readOnly={false}
            value={detectorName}
            onBlur={this.onBlur}
            onChange={this.onNameChange}
            required={nameFieldTouched}
            data-test-subj={'define-detector-detector-name'}
          />
        </EuiFormRow>
        <EuiSpacer size={'m'} />

        {/*// TODO: Implement regex pattern validation for description field.*/}
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
