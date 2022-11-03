/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
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
import { BrowserServices } from '../../../models/interfaces';
import { ReviewAndCreate } from '../components/ReviewAndCreate/containers/ReviewAndCreate';
import { CreateDetectorRulesOptions } from '../../../models/types';
import { CreateDetectorRulesState } from '../components/DefineDetector/components/DetectionRules/DetectionRules';
import {
  RuleItem,
  RuleItemInfo,
} from '../components/DefineDetector/components/DetectionRules/types/interfaces';
import { RuleInfo } from '../../../../server/models/interfaces/Rules';

interface CreateDetectorProps extends RouteComponentProps {
  isEdit: boolean;
  services: BrowserServices;
}

interface CreateDetectorState {
  currentStep: DetectorCreationStep;
  detector: Detector;
  fieldMappings: FieldMapping[];
  stepDataValid: { [step in DetectorCreationStep]: boolean };
  creatingDetector: boolean;
  rulesState: CreateDetectorRulesState;
}

export default class CreateDetector extends Component<CreateDetectorProps, CreateDetectorState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateDetectorProps) {
    super(props);
    const initialDetector = EMPTY_DEFAULT_DETECTOR;
    this.state = {
      currentStep: DetectorCreationStep.DEFINE_DETECTOR,
      detector: initialDetector,
      fieldMappings: [],
      stepDataValid: {
        [DetectorCreationStep.DEFINE_DETECTOR]: false,
        [DetectorCreationStep.CONFIGURE_FIELD_MAPPING]: true,
        [DetectorCreationStep.CONFIGURE_ALERTS]: false,
        [DetectorCreationStep.REVIEW_CREATE]: false,
      },
      creatingDetector: false,
      rulesState: { page: { index: 0 }, allRules: [] },
    };
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.DETECTORS]);
    this.setupRulesState();
  }

  componentDidUpdate(
    prevProps: Readonly<CreateDetectorProps>,
    prevState: Readonly<CreateDetectorState>,
    snapshot?: any
  ): void {
    if (prevState.detector.detector_type !== this.state.detector.detector_type) {
      this.setupRulesState();
    }
  }

  changeDetector = (detector: Detector) => {
    this.setState({ detector: detector });
  };

  replaceFieldMappings = (fieldMappings: FieldMapping[]): void => {
    this.setState({ fieldMappings });
  };

  onCreateClick = async () => {
    const { creatingDetector, detector, fieldMappings } = this.state;
    if (creatingDetector) {
      return;
    }

    this.setState({ creatingDetector: true });
    const createMappingsRes = await this.props.services.fieldMappingService.createMappings(
      detector.inputs[0].detector_input.indices[0],
      detector.detector_type,
      fieldMappings
    );

    if (createMappingsRes.ok) {
      console.log('Field mapping creation successful');
    }

    const createDetectorRes = await this.props.services.detectorsService.createDetector(detector);

    if (createDetectorRes.ok) {
      this.props.history.push(ROUTES.DETECTORS);
    } else {
      // TODO: show toast notification with error
    }
  };

  onNextClick = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep + 1 });
  };

  onPreviousClick = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep - 1 });
  };

  setCurrentStep = (currentStep: DetectorCreationStep) => {
    this.setState({ currentStep });
  };

  updateDataValidState = (step: DetectorCreationStep, isValid: boolean): void => {
    this.setState({
      stepDataValid: {
        ...this.state.stepDataValid,
        [step]: isValid,
      },
    });
  };

  getRulesOptions(): CreateDetectorRulesOptions {
    const allRules = this.state.rulesState.allRules;
    const options: CreateDetectorRulesOptions = allRules.map((rule) => ({
      id: rule._id,
      name: rule._source.title,
      severity: rule._source.level,
      tags: rule._source.tags.map((tag: { value: string }) => tag.value),
    }));

    return options;
  }

  async setupRulesState() {
    const prePackagedRules = await this.getRules(true);
    const customRules = await this.getRules(false);

    this.setState({
      rulesState: {
        ...this.state.rulesState,
        allRules: customRules.concat(prePackagedRules),
        page: {
          index: 0,
        },
      },
      detector: {
        ...this.state.detector,
        inputs: [
          {
            detector_input: {
              ...this.state.detector.inputs[0].detector_input,
              pre_packaged_rules: prePackagedRules.map((rule) => ({ id: rule._id })),
              custom_rules: customRules.map((rule) => ({ id: rule._id })),
            },
          },
        ],
      },
    });
  }

  async getRules(prePackaged: boolean): Promise<RuleItemInfo[]> {
    try {
      const { detector_type } = this.state.detector;

      if (!detector_type) {
        return [];
      }

      const rulesRes = await this.props.services.ruleService.getRules(prePackaged, {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              bool: {
                must: [{ match: { 'rule.category': `${detector_type}` } }],
              },
            },
          },
        },
      });

      if (rulesRes.ok) {
        const rules: RuleItemInfo[] = rulesRes.response.hits.hits.map((ruleInfo: RuleInfo) => {
          return {
            ...ruleInfo,
            enabled: true,
            prePackaged,
          };
        });

        return rules;
      } else {
        return [];
      }
    } catch (error: any) {
      return [];
    }
  }

  onPageChange = (page: { index: number; size: number }) => {
    this.setState({
      rulesState: {
        ...this.state.rulesState,
        page: { index: page.index },
      },
    });
  };

  onRuleToggle = (changedItem: RuleItem, isActive: boolean) => {
    const ruleIndex = this.state.rulesState.allRules.findIndex((ruleItemInfo) => {
      return ruleItemInfo._id === changedItem.id;
    });

    if (ruleIndex > -1) {
      const newRules: RuleItemInfo[] = [
        ...this.state.rulesState.allRules.slice(0, ruleIndex),
        { ...this.state.rulesState.allRules[ruleIndex], enabled: isActive },
        ...this.state.rulesState.allRules.slice(ruleIndex + 1),
      ];

      this.setState({
        rulesState: {
          ...this.state.rulesState,
          allRules: newRules,
        },
      });
    }
  };

  onAllRulesToggle = (enabled: boolean) => {
    const newRules: RuleItemInfo[] = this.state.rulesState.allRules.map((rule) => ({
      ...rule,
      enabled,
    }));

    this.setState({
      rulesState: {
        ...this.state.rulesState,
        allRules: newRules,
      },
    });
  };

  getStepContent = () => {
    const { services } = this.props;
    switch (this.state.currentStep) {
      case DetectorCreationStep.DEFINE_DETECTOR:
        return (
          <DefineDetector
            {...this.props}
            detector={this.state.detector}
            indexService={services.indexService}
            rulesState={this.state.rulesState}
            onRuleToggle={this.onRuleToggle}
            onAllRulesToggle={this.onAllRulesToggle}
            onPageChange={this.onPageChange}
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
            rulesOptions={this.getRulesOptions()}
            changeDetector={this.changeDetector}
            updateDataValidState={this.updateDataValidState}
            notificationsService={services.notificationsService}
          />
        );
      case DetectorCreationStep.REVIEW_CREATE:
        return (
          <ReviewAndCreate
            detector={this.state.detector}
            existingMappings={this.state.fieldMappings}
            setDetectorCreationStep={this.setCurrentStep}
            {...this.props}
          />
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
                disabled={!stepDataValid[currentStep]}
              >
                Next
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep === DetectorCreationStep.REVIEW_CREATE && (
            <EuiFlexItem grow={false}>
              <EuiButton
                isLoading={this.state.creatingDetector}
                fill={true}
                onClick={this.onCreateClick}
              >
                Create
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </form>
    );
  }
}
