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
import { Detector, FieldMapping } from '../../../../models/interfaces';
import { EMPTY_DEFAULT_DETECTOR } from '../../../utils/constants';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import { CoreServicesContext } from '../../../components/core_services';
import { DetectorCreationStep } from '../models/types';
import { ServicesConsumer } from '../../../services';
import { BrowserServices } from '../../../models/interfaces';

interface CreateDetectorProps extends RouteComponentProps {
  isEdit: boolean;
}

interface CreateDetectorState {
  currentStep: DetectorCreationStep;
  detector: Detector;
  fieldMappings: FieldMapping[];
  stepDataValid: { [step in DetectorCreationStep]: boolean };
}

export default class CreateDetector extends Component<CreateDetectorProps, CreateDetectorState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateDetectorProps) {
    super(props);
    this.state = {
      currentStep: DetectorCreationStep.DEFINE_DETECTOR,
      detector: EMPTY_DEFAULT_DETECTOR,
      fieldMappings: [],
      stepDataValid: {
        [DetectorCreationStep.DEFINE_DETECTOR]: false,
        [DetectorCreationStep.CONFIGURE_FIELD_MAPPING]: false,
        [DetectorCreationStep.CONFIGURE_ALERTS]: false,
        [DetectorCreationStep.REVIEW_CREATE]: false,
      },
    };
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.DETECTORS]);
  }

  changeDetector = (detector: Detector) => {
    this.setState({ detector: detector });
  };

  replaceFieldMappings = (fieldMappings: FieldMapping[]): void => {
    this.setState({ fieldMappings });
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

  updateDataValidState = (step: DetectorCreationStep, isValid: boolean): void => {
    this.setState({
      stepDataValid: {
        ...this.state.stepDataValid,
        [step]: isValid,
      },
    });
  };

  getStepContent = (services: BrowserServices) => {
    switch (this.state.currentStep) {
      case DetectorCreationStep.DEFINE_DETECTOR:
        return (
          <DefineDetector
            {...this.props}
            detector={this.state.detector}
            indexService={services.indexService}
            changeDetector={this.changeDetector}
            updateDataValidState={this.updateDataValidState}
          />
        );
      case DetectorCreationStep.CONFIGURE_FIELD_MAPPING:
        return (
          <ConfigureFieldMapping
            {...this.props}
            detector={this.state.detector}
            filedMappingService={services.fieldMappingService}
            fieldMappings={this.state.fieldMappings}
            replaceFieldMappings={this.replaceFieldMappings}
            updateDataValidState={this.updateDataValidState}
          />
        );
      case DetectorCreationStep.CONFIGURE_ALERTS:
        return (
          <ConfigureAlerts
            {...this.props}
            detector={this.state.detector}
            changeDetector={this.changeDetector}
            updateDataValidState={this.updateDataValidState}
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

  createStepsMetadata(currentStep: number): EuiContainedStepProps[] {
    return Object.values(createDetectorSteps).map((stepData) => ({
      title: stepData.title,
      status: currentStep < stepData.step + 1 ? 'disabled' : 'complete',
      children: <></>,
    }));
  }

  render() {
    const { currentStep, stepDataValid } = this.state;
    const steps: EuiContainedStepProps[] = this.createStepsMetadata(currentStep);

    return (
      <ServicesConsumer>
        {(services: BrowserServices | null) =>
          services && (
            <form onSubmit={this.onCreateClick}>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiSteps steps={steps} titleSize={'xs'} />
                </EuiFlexItem>
                <EuiFlexItem>{this.getStepContent(services)}</EuiFlexItem>
              </EuiFlexGroup>

              <EuiFlexGroup alignItems={'center'} justifyContent={'flexEnd'}>
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty href={`${PLUGIN_NAME}#${ROUTES.DETECTORS}`}>
                    Cancel
                  </EuiButtonEmpty>
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
                      disabled={!stepDataValid[currentStep]}
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
          )
        }
      </ServicesConsumer>
    );
  }
}
