/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { Detector } from '../../../../../../models/interfaces';
import DetectorBasicDetailsForm from '../components/DetectorDetails';
import DetectorDataSource from '../components/DetectorDataSource';
import DetectorType from '../components/DetectorType';
import DetectionRules from '../components/DetectionRules';
import { EuiComboBoxOptionOption } from '@opensearch-project/oui';

interface DefineDetectorProps extends RouteComponentProps {
  changeDetector: (detector: Detector) => void;
  detector: Detector;
  isEdit: boolean;
}

interface DefineDetectorState {
  hasSubmitted: boolean;
}

export default class DefineDetector extends Component<DefineDetectorProps, DefineDetectorState> {
  constructor(props: DefineDetectorProps) {
    super(props);
    this.state = {
      hasSubmitted: false,
    };
  }

  componentDidMount = async () => {
    if (this.props.isEdit) {
      // TODO: Retrieve detector using ID, and set state.detector to the result
    }
  };

  onDetectorNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const detectorName = e.target.value;
    const { changeDetector, detector } = this.props;
    changeDetector({ ...detector, name: detectorName });
  };

  onDetectorTypeChange = (detectorType: string) => {
    const { changeDetector, detector } = this.props;
    changeDetector({ ...detector, detector_type: detectorType });
  };

  onDetectorInputDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>, index = 0) => {
    const detectorDescription = e.target.value;
    const { changeDetector, detector } = this.props;
    const detectorInputs = detector.inputs;
    detectorInputs[index].input.description = detectorDescription;
    changeDetector({ ...detector, inputs: detectorInputs });
  };

  onDetectorInputIndicesChange = (
    selectedOptions: EuiComboBoxOptionOption<string>[],
    index = 0
  ) => {
    const detectorIndices = selectedOptions.map((selectedOption) => selectedOption.label);
    const { changeDetector, detector } = this.props;
    const detectorInputs = detector.inputs;
    detectorInputs[index].input.indices = detectorIndices;
    changeDetector({ ...detector, inputs: detectorInputs });
  };

  onSubmit = () => {
    this.setState({ hasSubmitted: true });
  };

  render() {
    const {
      isEdit,
      detector: { name, detector_type, inputs },
    } = this.props;
    const { hasSubmitted } = this.state;
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>{`${isEdit ? 'Edit' : 'Define'} detector`}</h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        <DetectorBasicDetailsForm
          hasSubmitted={hasSubmitted}
          detectorName={name}
          detectorDescription={inputs[0].input.description}
          onDetectorNameChange={this.onDetectorNameChange}
          onDetectorInputDescriptionChange={this.onDetectorInputDescriptionChange}
          {...this.props}
        />

        <EuiSpacer size={'m'} />

        <DetectorDataSource
          hasSubmitted={hasSubmitted}
          detectorIndices={inputs[0].input.indices}
          onDetectorInputIndicesChange={this.onDetectorInputIndicesChange}
          {...this.props}
        />

        <EuiSpacer size={'m'} />

        <DetectorType
          hasSubmitted={hasSubmitted}
          detectorType={detector_type}
          onDetectorTypeChange={this.onDetectorTypeChange}
        />

        <EuiSpacer size={'m'} />

        <DetectionRules
          {...this.props}
          isEdit={isEdit}
          hasSubmitted={hasSubmitted}
          detectorRules={inputs[0].input.rules}
        />
      </div>
    );
  }
}
