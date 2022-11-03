/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { EuiFormRow, EuiFieldText, EuiSpacer, EuiTextArea } from '@elastic/eui';
import { FormFieldHeader } from '../../../../../../components/FormFieldHeader/FormFieldHeader';

// TODO: Implement regex pattern to validate name and description strings

interface DetectorDetailsProps {
  detectorName: string;
  detectorDescription: string;
  onDetectorNameChange: (name: string) => void;
  onDetectorInputDescriptionChange: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

interface DetectorDetailsState {
  nameChangedOnce: boolean;
  nameIsInvalid: boolean;
}

export default class DetectorBasicDetailsForm extends Component<
  DetectorDetailsProps,
  DetectorDetailsState
> {
  constructor(props: DetectorDetailsProps) {
    super(props);
    this.state = {
      nameChangedOnce: false,
      nameIsInvalid: false,
    };
  }

  getErrorMessage = () => {
    return 'Enter a name for the detector.';
  };

  onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nameChangedOnce: true, nameIsInvalid: !event.target.value });
    this.props.onDetectorNameChange(event.target.value);
  };

  render() {
    const { detectorName, detectorDescription, onDetectorInputDescriptionChange } = this.props;
    const { nameIsInvalid } = this.state;

    return (
      <ContentPanel title={'Detector details'} titleSize={'m'}>
        <EuiSpacer size={'m'} />
        <EuiFormRow
          label={<FormFieldHeader headerTitle={'Name'} />}
          isInvalid={nameIsInvalid}
          error={this.getErrorMessage()}
        >
          <EuiFieldText
            placeholder={'Enter a name for the detector.'}
            readOnly={false}
            value={detectorName}
            onChange={this.onNameChange}
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
