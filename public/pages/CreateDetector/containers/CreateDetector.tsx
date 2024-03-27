/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSteps,
  EuiTitle,
} from '@elastic/eui';
import DefineDetector from '../components/DefineDetector/containers/DefineDetector';
import { createDetectorSteps, PENDING_DETECTOR_ID } from '../utils/constants';
import {
  BREADCRUMBS,
  EMPTY_DEFAULT_DETECTOR,
  OS_NOTIFICATION_PLUGIN,
  PLUGIN_NAME,
  ROUTES,
} from '../../../utils/constants';
import ConfigureAlerts from '../components/ConfigureAlerts';
import { FieldMapping } from '../../../../models/interfaces';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import { CoreServicesContext } from '../../../components/core_services';
import { BrowserServices } from '../../../models/interfaces';
import { CreateDetectorRulesOptions } from '../../../models/types';
import { CreateDetectorRulesState } from '../components/DefineDetector/components/DetectionRules/DetectionRules';
import {
  RuleItem,
  RuleItemInfo,
} from '../components/DefineDetector/components/DetectionRules/types/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { getPlugins } from '../../../utils/helpers';
import { CreateDetectorSteps, Detector, DetectorCreationStep } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { errorNotificationToast } from '../../../utils/helpers';
import { MetricsContext } from '../../../metrics/MetricsContext';

interface CreateDetectorProps extends RouteComponentProps {
  isEdit: boolean;
  services: BrowserServices;
  metrics: MetricsContext;
  history: RouteComponentProps['history'];
  notifications: NotificationsStart;
}

export interface CreateDetectorState {
  currentStep: DetectorCreationStep;
  detector: Detector;
  fieldMappings: FieldMapping[];
  stepDataValid: { [step in DetectorCreationStep | string]: boolean };
  creatingDetector: boolean;
  rulesState: CreateDetectorRulesState;
  plugins: string[];
  loadingRules: boolean;
}

export default class CreateDetector extends Component<CreateDetectorProps, CreateDetectorState> {
  static contextType = CoreServicesContext;
  private triggerCounter = 1;

  constructor(props: CreateDetectorProps) {
    super(props);

    let detectorInput = {}; // if there is detector state in history, then use it to populate all the fields
    const historyState = this.props.history.location.state as any;
    if (historyState) detectorInput = historyState.detectorInput;

    this.state = {
      currentStep: DetectorCreationStep.DEFINE_DETECTOR,
      detector: {
        ...EMPTY_DEFAULT_DETECTOR,
        detector_type: '',
        triggers: [],
      },
      fieldMappings: [],
      stepDataValid: {
        [DetectorCreationStep.DEFINE_DETECTOR]: false,
        [DetectorCreationStep.CONFIGURE_ALERTS]: false,
      },
      creatingDetector: false,
      rulesState: { page: { index: 0 }, allRules: [] },
      plugins: [],
      loadingRules: false,
      ...detectorInput,
    };
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.DETECTORS_CREATE,
    ]);
    if (!(this.props.history.location.state as any)?.detectorInput) {
      this.setupRulesState();
      this.props.metrics.detectorMetricsManager.resetMetrics();
      this.props.metrics.detectorMetricsManager.sendMetrics(CreateDetectorSteps.started);
      this.getPlugins();
    }
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

    const fieldsMappingPromise = this.props.services.fieldMappingService.createMappings(
      detector.inputs[0].detector_input.indices[0],
      detector.detector_type,
      fieldMappings
    );

    const fieldMappingRes = await fieldsMappingPromise;

    if (!fieldMappingRes.ok) {
      errorNotificationToast(
        this.props.notifications,
        'create',
        'detector',
        'Invalid field mappings.'
      );
      this.setState({ creatingDetector: false });
      return;
    }

    const createDetectorPromise = this.props.services.detectorsService.createDetector(detector);

    this.setState({ creatingDetector: false }, () => {
      // set detector pending state, this will be used in detector details page
      DataStore.detectors.setState(
        {
          pendingRequests: [fieldsMappingPromise, createDetectorPromise],
          detectorInput: { ...this.state },
        },
        this.props.history
      );
    });

    this.props.metrics.detectorMetricsManager.sendMetrics(CreateDetectorSteps.createClicked);

    // navigate to detector details
    this.props.history.push(`${ROUTES.DETECTOR_DETAILS}/${PENDING_DETECTOR_ID}`);
  };

  onNextClick = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep + 1 });
    this.props.metrics.detectorMetricsManager.sendMetrics(CreateDetectorSteps.stepTwoInitiated);
  };

  onPreviousClick = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep - 1 });
  };

  setCurrentStep = (currentStep: DetectorCreationStep) => {
    this.setState({ currentStep });
  };

  updateDataValidState = (step: DetectorCreationStep | string, isValid: boolean): void => {
    this.setState({
      stepDataValid: {
        ...this.state.stepDataValid,
        [step]: isValid,
      },
    });
  };

  getRulesOptions(): CreateDetectorRulesOptions {
    const enabledRules = this.state.rulesState.allRules.filter((rule) => rule.enabled);
    return enabledRules.map((rule) => ({
      id: rule._id,
      name: rule._source.title,
      severity: rule._source.level,
      tags: rule._source.tags.map((tag: { value: string }) => tag.value),
    }));
  }

  async setupRulesState() {
    const { detector_type } = this.state.detector;
    this.setState({
      loadingRules: true,
    });

    const allRules = await DataStore.rules.getAllRules({
      'rule.category': [detector_type],
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

  getNextTriggerName = () => {
    return `Trigger ${this.triggerCounter++}`;
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
      this.props.metrics.detectorMetricsManager.sendMetrics(CreateDetectorSteps.rulesConfigured);
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
    this.props.metrics.detectorMetricsManager.sendMetrics(CreateDetectorSteps.rulesConfigured);
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
            fieldMappingService={services.fieldMappingService}
            fieldMappings={this.state.fieldMappings}
            rulesState={this.state.rulesState}
            loadingRules={this.state.loadingRules}
            onRuleToggle={this.onRuleToggle}
            onAllRulesToggle={this.onAllRulesToggle}
            onPageChange={this.onPageChange}
            changeDetector={this.changeDetector}
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
            getTriggerName={this.getNextTriggerName}
            metricsContext={this.props.metrics}
          />
        );
    }
  };

  createStepsMetadata(currentStep: number): EuiContainedStepProps[] {
    return Object.values(createDetectorSteps).map((stepData) => ({
      title: stepData.title,
      status:
        currentStep > stepData.step
          ? 'complete'
          : currentStep < stepData.step
          ? 'disabled'
          : undefined,
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
          <EuiFlexItem>
            <>
              <EuiTitle>
                <h1>Create detector</h1>
              </EuiTitle>
              <EuiSpacer />
              {this.getStepContent()}
            </>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup alignItems={'center'} justifyContent={'flexEnd'}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty href={`${PLUGIN_NAME}#${ROUTES.DETECTORS}`}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>

          {currentStep > DetectorCreationStep.DEFINE_DETECTOR && (
            <EuiFlexItem grow={false}>
              <EuiButton disabled={creatingDetector} onClick={this.onPreviousClick}>
                Back
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep < DetectorCreationStep.CONFIGURE_ALERTS && (
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

          {currentStep === DetectorCreationStep.CONFIGURE_ALERTS && (
            <EuiFlexItem grow={false}>
              <EuiButton
                disabled={creatingDetector || !stepDataValid[currentStep]}
                isLoading={creatingDetector}
                fill={true}
                onClick={this.onCreateClick}
              >
                Create detector
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </form>
    );
  }
}
