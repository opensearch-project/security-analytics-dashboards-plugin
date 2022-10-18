/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../components/ContentPanel';
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiSteps } from '@elastic/eui';
import DefineDetector from '../components/DefineDetector/containers/DefineDetector';
import { createDetectorSteps } from '../utils/constants';
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from '../../../utils/constants';
import ConfigureFieldMapping from '../components/ConfigureFieldMapping';
import ConfigureAlerts from '../components/ConfigureAlerts';
import { Detector } from '../../../../models/interfaces';
import { EMPTY_DEFAULT_DETECTOR } from '../../../utils/constants';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import { CoreServicesContext } from '../../../components/core_services';
import { DetectorCreationStep } from '../models/types';

interface CreateDetectorProps extends RouteComponentProps {
  isEdit: boolean;
}

interface StepState {
  isComplete: boolean;
}

interface CreateDetectorState {
  stepsState: Record<DetectorCreationStep, StepState>;
  currentStep: DetectorCreationStep;
  detector: Detector;
}

export default class CreateDetector extends Component<CreateDetectorProps, CreateDetectorState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateDetectorProps) {
    super(props);
    this.state = {
      stepsState: {
        [DetectorCreationStep.DEFINE_DETECTOR]: { isComplete: false },
        [DetectorCreationStep.CONFIGURE_FIELD_MAPPING]: { isComplete: false },
        [DetectorCreationStep.CONFIGURE_ALERTS]: { isComplete: false },
        [DetectorCreationStep.REVIEW_CREATE]: { isComplete: false },
      },
      currentStep: DetectorCreationStep.DEFINE_DETECTOR,
      detector: EMPTY_DEFAULT_DETECTOR,
    };
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.DETECTORS]);
  }

  changeDetector = (detector: Detector) => {
    this.setState({ detector: detector });
  };

  onCreateClick = () => {};

  onNextClick = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep + 1 });
  };

  onPreviousClick = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep - 1 });
  };

  onStepCompletionChange = (
    step: DetectorCreationStep,
    isComplete: boolean,
    mergeDetectorData?: (detector: Detector) => Detector
  ): void => {
    this.setState({
      stepsState: {
        ...this.state.stepsState,
        [step]: {
          isComplete,
        },
      },
      detector: mergeDetectorData
        ? { ...mergeDetectorData(this.state.detector) }
        : this.state.detector,
    });
  };

  getStepContent = () => {
    switch (this.state.currentStep) {
      case DetectorCreationStep.DEFINE_DETECTOR:
        return (
          <DefineDetector
            {...this.props}
            detector={this.state.detector}
            onCompletion={this.onStepCompletionChange}
          />
        );
      case DetectorCreationStep.CONFIGURE_FIELD_MAPPING:
        return (
          <ConfigureFieldMapping
            {...this.props}
            detector={this.state.detector}
            onDetectorChange={this.changeDetector}
          />
        );
      case DetectorCreationStep.CONFIGURE_ALERTS:
        return (
          <ConfigureAlerts
            {...this.props}
            detector={this.state.detector}
            changeDetector={this.changeDetector}
          />
        );
      case DetectorCreationStep.REVIEW_CREATE:
        return (
          <ContentPanel
            title={createDetectorSteps[DetectorCreationStep.REVIEW_CREATE].title}
          ></ContentPanel>
        );
    }
  };

  updateStepCompletion = (step: DetectorCreationStep, isComplete: boolean): void => {
    this.setState({
      stepsState: {
        ...this.state.stepsState,
        [step]: { isComplete },
      },
    });
  };

  createStepsMetadata(currentStep: number): EuiContainedStepProps[] {
    return Object.values(createDetectorSteps).map((stepData) => ({
      title: stepData.title,
      status: currentStep < stepData.step + 1 ? 'disabled' : 'complete',
      children: <></>,
    }));
  }

  render() {
    const { currentStep, stepsState } = this.state;
    const steps: EuiContainedStepProps[] = this.createStepsMetadata(currentStep);

    return (
      <form onSubmit={this.onCreateClick}>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiSteps steps={steps} titleSize={'xs'} />
          </EuiFlexItem>
          <EuiFlexItem>{this.getStepContent()}</EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup alignItems={'center'} justifyContent={'flexEnd'}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty href={`${PLUGIN_NAME}#${ROUTES.DETECTORS}`}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>

          {currentStep > DetectorCreationStep.DEFINE_DETECTOR && (
            <EuiFlexItem grow={false}>
              <EuiButton onClick={this.onPreviousClick}>Previous</EuiButton>
            </EuiFlexItem>
          )}

          {currentStep < DetectorCreationStep.REVIEW_CREATE && (
            <EuiFlexItem grow={false}>
              <EuiButton
                fill={true}
                onClick={this.onNextClick}
                disabled={!stepsState[currentStep].isComplete}
              >
                Next
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep === DetectorCreationStep.REVIEW_CREATE && (
            <EuiFlexItem grow={false}>
              <EuiButton fill={true} onClick={this.onNextClick}>
                Create
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </form>
    );
  }
}
