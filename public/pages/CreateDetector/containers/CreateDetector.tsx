/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiSteps } from '@elastic/eui';
import DefineDetector from '../components/DefineDetector/containers/DefineDetector';
import { createDetectorSteps } from '../utils/constants';
import {
  BREADCRUMBS,
  EMPTY_DEFAULT_DETECTOR,
  PLUGIN_NAME,
  ROUTES,
  OS_NOTIFICATION_PLUGIN,
} from '../../../utils/constants';
import ConfigureFieldMapping from '../components/ConfigureFieldMapping';
import ConfigureAlerts from '../components/ConfigureAlerts';
import { Detector, FieldMapping } from '../../../../models/interfaces';
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
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  errorNotificationToast,
  successNotificationToast,
  getPlugins,
} from '../../../utils/helpers';
import { RulesViewModelActor } from '../../Rules/models/RulesViewModelActor';

interface CreateDetectorProps extends RouteComponentProps {
  isEdit: boolean;
  services: BrowserServices;
  notifications: NotificationsStart;
}

interface CreateDetectorState {
  currentStep: DetectorCreationStep;
  detector: Detector;
  fieldMappings: FieldMapping[];
  stepDataValid: { [step in DetectorCreationStep]: boolean };
  creatingDetector: boolean;
  rulesState: CreateDetectorRulesState;
  plugins: string[];
  loadingRules: boolean;
}

export default class CreateDetector extends Component<CreateDetectorProps, CreateDetectorState> {
  static contextType = CoreServicesContext;
  private rulesViewModelActor: RulesViewModelActor;

  constructor(props: CreateDetectorProps) {
    super(props);
    this.rulesViewModelActor = new RulesViewModelActor(props.services.ruleService);
    this.state = {
      currentStep: DetectorCreationStep.DEFINE_DETECTOR,
      detector: EMPTY_DEFAULT_DETECTOR,
      fieldMappings: [],
      stepDataValid: {
        [DetectorCreationStep.DEFINE_DETECTOR]: false,
        [DetectorCreationStep.CONFIGURE_FIELD_MAPPING]: true,
        [DetectorCreationStep.CONFIGURE_ALERTS]: false,
        [DetectorCreationStep.REVIEW_CREATE]: false,
      },
      creatingDetector: false,
      rulesState: { page: { index: 0 }, allRules: [] },
      plugins: [],
      loadingRules: false,
    };
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.DETECTORS_CREATE,
    ]);
    this.setupRulesState();
    this.getPlugins();
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
    try {
      const createMappingsRes = await this.props.services.fieldMappingService.createMappings(
        detector.inputs[0].detector_input.indices[0],
        detector.detector_type,
        fieldMappings
      );
      if (!createMappingsRes.ok) {
        errorNotificationToast(
          this.props.notifications,
          'create',
          'detector',
          'Double check the field mappings and try again.'
        );
      } else {
        const createDetectorRes = await this.props.services.detectorsService.createDetector(
          detector
        );
        if (createDetectorRes.ok) {
          successNotificationToast(
            this.props.notifications,
            'created',
            `detector, "${detector.name}"`
          );
          this.props.history.push(`${ROUTES.DETECTOR_DETAILS}/${createDetectorRes.response._id}`);
        } else {
          errorNotificationToast(
            this.props.notifications,
            'create',
            'detector',
            createDetectorRes.error
          );
        }
      }
    } catch (error: any) {
      errorNotificationToast(this.props.notifications, 'create', 'detector', error);
    }
    this.setState({ creatingDetector: false });
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
    const enabledRules = this.state.rulesState.allRules.filter((rule) => rule.enabled);
    const options: CreateDetectorRulesOptions = enabledRules.map((rule) => ({
      id: rule._id,
      name: rule._source.title,
      severity: rule._source.level,
      tags: rule._source.tags.map((tag: { value: string }) => tag.value),
    }));

    return options;
  }

  async setupRulesState() {
    const { detector_type } = this.state.detector;
    this.setState({
      loadingRules: true,
    });
    const allRules = await this.rulesViewModelActor.fetchRules(undefined, {
      bool: {
        must: [{ match: { 'rule.category': `${detector_type}` } }],
      },
    });

    const prePackagedRules = allRules.filter((rule) => rule.prePackaged);
    const customRules = allRules.filter((rule) => !rule.prePackaged);

    this.setState({
      rulesState: {
        ...this.state.rulesState,
        allRules: customRules.concat(prePackagedRules).map((rule) => ({ ...rule, enabled: true })),
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
      loadingRules: false,
    });
  }

  async getPlugins() {
    const { services } = this.props;
    const plugins = await getPlugins(services.opensearchService);

    this.setState({ plugins });
  }

  onPageChange = (page: { index: number; size: number }) => {
    this.setState({
      rulesState: {
        ...this.state.rulesState,
        page: { index: page.index },
      },
    });
  };

  getDetectorWithUpdatedRules(newRules: RuleItemInfo[]) {
    return {
      ...this.state.detector,
      inputs: [
        {
          ...this.state.detector.inputs[0],
          detector_input: {
            ...this.state.detector.inputs[0].detector_input,
            pre_packaged_rules: newRules
              .filter((rule) => rule.enabled && rule.prePackaged)
              .map((rule) => ({ id: rule._id })),
            custom_rules: newRules
              .filter((rule) => rule.enabled && !rule.prePackaged)
              .map((rule) => ({ id: rule._id })),
          },
        },
        ...this.state.detector.inputs.slice(1),
      ],
    };
  }

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
        detector: this.getDetectorWithUpdatedRules(newRules),
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
      detector: this.getDetectorWithUpdatedRules(newRules),
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
            loadingRules={this.state.loadingRules}
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
            loading={false}
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
            hasNotificationPlugin={this.state.plugins.includes(OS_NOTIFICATION_PLUGIN)}
          />
        );
      case DetectorCreationStep.REVIEW_CREATE:
        return (
          <ReviewAndCreate
            {...this.props}
            detector={this.state.detector}
            existingMappings={this.state.fieldMappings}
            setDetectorCreationStep={this.setCurrentStep}
          />
        );
    }
  };

  createStepsMetadata(currentStep: number): EuiContainedStepProps[] {
    return Object.values(createDetectorSteps).map((stepData) => ({
      title: stepData.title,
      status: currentStep < stepData.step ? 'disabled' : undefined,
      children: <></>,
    }));
  }

  render() {
    const { creatingDetector, currentStep, stepDataValid } = this.state;
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
              <EuiButton disabled={creatingDetector} onClick={this.onPreviousClick}>
                Previous
              </EuiButton>
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
                disabled={creatingDetector}
                isLoading={creatingDetector}
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
