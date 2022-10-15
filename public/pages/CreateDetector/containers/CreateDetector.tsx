/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../components/ContentPanel';
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiSteps } from '@elastic/eui';
import DefineDetector from '../components/DefineDetector/containers/DefineDetector';
import { CREATE_DETECTOR_STEPS } from '../utils/constants';
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from '../../../utils/constants';
import ConfigureFieldMapping from '../components/ConfigureFieldMapping';
import ConfigureAlerts from '../components/ConfigureAlerts';
import { Detector } from '../../../../models/interfaces';
import { EMPTY_DEFAULT_DETECTOR } from '../../../utils/constants';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import { CoreServicesContext } from '../../../components/core_services';

interface CreateDetectorProps extends RouteComponentProps {
  isEdit: boolean;
}

interface CreateDetectorState {
  currentStep: number;
  detector: Detector;
}

export default class CreateDetector extends Component<CreateDetectorProps, CreateDetectorState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateDetectorProps) {
    super(props);
    this.state = {
      currentStep: CREATE_DETECTOR_STEPS.DEFINE_DETECTOR.step,
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

  getStepContent = () => {
    switch (this.state.currentStep) {
      case CREATE_DETECTOR_STEPS.DEFINE_DETECTOR.step:
        return (
          <DefineDetector
            {...this.props}
            detector={this.state.detector}
            changeDetector={this.changeDetector}
          />
        );
      case CREATE_DETECTOR_STEPS.CONFIGURE_FIELD_MAPPING.step:
        return (
          <ConfigureFieldMapping
            {...this.props}
            detector={this.state.detector}
            onDetectorChange={this.changeDetector}
          />
        );
      case CREATE_DETECTOR_STEPS.CONFIGURE_ALERTS.step:
        return (
          <ConfigureAlerts
            {...this.props}
            detector={this.state.detector}
            changeDetector={this.changeDetector}
          />
        );
      case CREATE_DETECTOR_STEPS.REVIEW_CREATE.step:
        return <ContentPanel title={CREATE_DETECTOR_STEPS.REVIEW_CREATE.title}></ContentPanel>;
    }
  };

  render() {
    const { currentStep } = this.state;
    const steps: EuiContainedStepProps[] = [
      {
        title: CREATE_DETECTOR_STEPS.DEFINE_DETECTOR.title,
        status: currentStep <= CREATE_DETECTOR_STEPS.DEFINE_DETECTOR.step ? 'disabled' : 'complete',
        children: <></>,
      },
      {
        title: CREATE_DETECTOR_STEPS.CONFIGURE_FIELD_MAPPING.title,
        status:
          currentStep <= CREATE_DETECTOR_STEPS.CONFIGURE_FIELD_MAPPING.step
            ? 'disabled'
            : 'complete',
        children: <></>,
      },
      {
        title: CREATE_DETECTOR_STEPS.CONFIGURE_ALERTS.title,
        status:
          currentStep <= CREATE_DETECTOR_STEPS.CONFIGURE_ALERTS.step ? 'disabled' : 'complete',
        children: <></>,
      },
      {
        title: CREATE_DETECTOR_STEPS.REVIEW_CREATE.title,
        status: 'disabled',
        children: <></>,
      },
    ];
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

          {currentStep > CREATE_DETECTOR_STEPS.DEFINE_DETECTOR.step && (
            <EuiFlexItem grow={false}>
              <EuiButton onClick={this.onPreviousClick}>Previous</EuiButton>
            </EuiFlexItem>
          )}

          {currentStep < CREATE_DETECTOR_STEPS.REVIEW_CREATE.step && (
            <EuiFlexItem grow={false}>
              <EuiButton fill={true} onClick={this.onNextClick}>
                Next
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep === CREATE_DETECTOR_STEPS.REVIEW_CREATE.step && (
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
