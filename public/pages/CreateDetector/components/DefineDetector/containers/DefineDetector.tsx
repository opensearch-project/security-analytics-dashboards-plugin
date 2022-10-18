/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { Detector, Rule } from '../../../../../../models/interfaces';
import DetectorBasicDetailsForm from '../components/DetectorDetails';
import DetectorDataSource from '../components/DetectorDataSource';
import DetectorType from '../components/DetectorType';
import DetectionRules from '../components/DetectionRules';
import { EuiComboBoxOptionOption } from '@opensearch-project/oui';
import { DetectorCreationStep } from '../../../models/types';

import { ServicesConsumer } from '../../../../../services';
import { BrowserServices } from '../../../../../models/interfaces';

interface DefineDetectorProps extends RouteComponentProps {
  detector: Detector;
  isEdit: boolean;
  onCompletion: (
    step: DetectorCreationStep,
    isComplete: boolean,
    mergeDetectorData?: (detector: Detector) => Detector
  ) => void;
}

interface DefineDetectorState {
  hasSubmitted: boolean;
  detectorName: string;
  detectorDescription: string;
  indices: string[];
  detectorType: string;
  enabledCustomRuleIds: string[];
}

export default class DefineDetector extends Component<DefineDetectorProps, DefineDetectorState> {
  constructor(props: DefineDetectorProps) {
    super(props);
    this.state = {
      hasSubmitted: false,
      detectorName: props.detector.name,
      detectorDescription: props.detector.inputs[0].input.description,
      indices: props.detector.inputs[0].input.indices,
      detectorType: props.detector.detector_type,
      enabledCustomRuleIds: props.detector.inputs[0].input.enabledCustomRuleIds,
    };
  }

  componentDidMount = async () => {
    if (this.props.isEdit) {
      // TODO: Retrieve detector using ID, and set state.detector to the result
    }
  };

  isPageComplete(): boolean {
    const { detectorName, indices, detectorType } = this.state;
    return !!detectorName && indices.length > 0 && !!detectorType;
  }

  onDefinitionChange(isPageComplete: boolean): void {
    if (isPageComplete) {
      const {
        detectorName,
        detectorDescription,
        detectorType,
        enabledCustomRuleIds,
        indices,
      } = this.state;
      this.props.onCompletion(DetectorCreationStep.DEFINE_DETECTOR, true, (detector: Detector) => {
        return {
          ...detector,
          name: detectorName,
          detector_type: detectorType,
          inputs: [
            {
              input: {
                description: detectorDescription,
                indices,
                enabledCustomRuleIds,
              },
            },
          ],
        };
      });
    } else {
      this.props.onCompletion(DetectorCreationStep.DEFINE_DETECTOR, false);
    }
  }

  componentDidUpdate(
    _prevProps: Readonly<DefineDetectorProps>,
    prevState: Readonly<DefineDetectorState>
  ): void {
    const { detectorName: prevName, indices: pevIndices, detectorType: prevType } = prevState;
    const wasPageComplete = !!prevName && pevIndices.length > 0 && !!prevType;
    const { detectorName, indices, detectorType } = this.state;
    const isPageComplete = !!detectorName && indices.length > 0 && !!detectorType;

    if (wasPageComplete !== isPageComplete) {
      this.onDefinitionChange(isPageComplete);
    }
  }

  onDetectorNameChange = (detectorName: string) => {
    this.setState({ detectorName });
  };

  onDetectorInputDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>, index = 0) => {
    const detectorDescription = e.target.value;
    this.setState({ detectorDescription });
  };

  onDetectorInputIndicesChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const detectorIndices = selectedOptions.map((selectedOption) => selectedOption.label);
    this.setState({ indices: detectorIndices });
  };

  onDetectorTypeChange = (detectorType: string) => {
    this.setState({ detectorType });
  };

  onRulesChanged = (rules: Rule[]) => {};

  onSubmit = () => {
    this.setState({ hasSubmitted: true });
  };

  render() {
    const { isEdit } = this.props;
    const {
      hasSubmitted,
      detectorName,
      detectorDescription,
      detectorType,
      indices,
      enabledCustomRuleIds,
    } = this.state;
    return (
      <ServicesConsumer>
        {(services: BrowserServices | null) =>
          services && (
            <div>
              <EuiTitle size={'l'}>
                <h3>{`${isEdit ? 'Edit' : 'Define'} detector`}</h3>
              </EuiTitle>

              <EuiSpacer size={'m'} />

              <DetectorBasicDetailsForm
                hasSubmitted={hasSubmitted}
                detectorName={detectorName}
                detectorDescription={detectorDescription}
                onDetectorNameChange={this.onDetectorNameChange}
                onDetectorInputDescriptionChange={this.onDetectorInputDescriptionChange}
              />

              <EuiSpacer size={'m'} />

              <DetectorDataSource
                hasSubmitted={hasSubmitted}
                detectorIndices={indices}
                indexService={services.indexService}
                onDetectorInputIndicesChange={this.onDetectorInputIndicesChange}
                {...this.props}
              />

              <EuiSpacer size={'m'} />

              <DetectorType
                hasSubmitted={hasSubmitted}
                detectorType={detectorType}
                onDetectorTypeChange={this.onDetectorTypeChange}
              />

              <EuiSpacer size={'m'} />

              <DetectionRules
                {...this.props}
                enabledCustomRuleIds={enabledCustomRuleIds}
                detectorType={detectorType}
                onRulesChanged={this.onRulesChanged}
              />
            </div>
          )
        }
      </ServicesConsumer>
    );
  }
}
