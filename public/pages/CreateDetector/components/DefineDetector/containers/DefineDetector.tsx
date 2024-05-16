/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { PeriodSchedule } from '../../../../../../models/interfaces';
import DetectorBasicDetailsForm from '../components/DetectorDetails';
import DetectorDataSource from '../components/DetectorDataSource';
import DetectorType from '../components/DetectorType';
import { EuiComboBoxOptionOption } from '@opensearch-project/oui';
import {
  FieldMappingService,
  IndexService,
  SecurityAnalyticsContext,
} from '../../../../../services';
import { MIN_NUM_DATA_SOURCES } from '../../../../Detectors/utils/constants';
import { DetectorSchedule } from '../components/DetectorSchedule/DetectorSchedule';
import { RuleItem } from '../components/DetectionRules/types/interfaces';
import { CreateDetectorRulesState } from '../components/DetectionRules/DetectionRules';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { logTypesWithDashboards } from '../../../../../utils/constants';
import {
  CreateDetectorSteps,
  DataSourceProps,
  Detector,
  DetectorCreationStep,
  FieldMapping,
  SecurityAnalyticsContextType,
} from '../../../../../../types';
import { ConfigureFieldMappingProps } from '../../ConfigureFieldMapping/containers/ConfigureFieldMapping';
import { ContentPanel } from '../../../../../components/ContentPanel';
import { ruleTypes } from '../../../../Rules/utils/constants';
import { ThreatIntelligence } from '../components/ThreatIntelligence/ThreatIntelligence';
import { addDetectionType, removeDetectionType } from '../../../../../utils/helpers';

interface DefineDetectorProps extends RouteComponentProps, DataSourceProps {
  detector: Detector;
  isEdit: boolean;
  indexService: IndexService;
  fieldMappingService: FieldMappingService;
  fieldMappings: FieldMapping[];
  rulesState: CreateDetectorRulesState;
  notifications: NotificationsStart;
  loadingRules?: boolean;
  changeDetector: (detector: Detector) => void;
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
  onPageChange: (page: { index: number; size: number }) => void;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
  replaceFieldMappings: (mappings: FieldMapping[]) => void;
}

interface DefineDetectorState {
  detector: Detector;
}

export default class DefineDetector extends Component<DefineDetectorProps, DefineDetectorState> {
  public static contextType?:
    | React.Context<SecurityAnalyticsContextType | null>
    | undefined = SecurityAnalyticsContext;
  private standardLogTypes = new Set(
    ruleTypes.filter((ruleType) => ruleType.isStandard).map(({ value }) => value)
  );

  constructor(props: DefineDetectorProps) {
    super(props);
    this.state = {
      detector: this.props.detector,
    };
  }

  componentDidUpdate(
    prevProps: Readonly<DefineDetectorProps>,
    prevState: Readonly<DefineDetectorState>,
    snapshot?: any
  ) {
    if (prevProps.detector !== this.props.detector) {
      this.setState({
        detector: this.props.detector,
      });
    }
  }

  updateDetectorCreationState(detector: Detector) {
    const isDataValid =
      !!detector.name &&
      !!detector.detector_type &&
      detector.inputs[0].detector_input.indices.length >= MIN_NUM_DATA_SOURCES &&
      !!detector.schedule.period.interval;

    this.props.changeDetector(detector);
    this.props.updateDataValidState(DetectorCreationStep.DEFINE_DETECTOR, isDataValid);
  }

  onDetectorNameChange = (detectorName: string) => {
    const newDetector: Detector = {
      ...this.state.detector,
      name: detectorName,
    };

    this.updateDetectorCreationState(newDetector);
  };

  onDetectorInputDescriptionChange = (description: string) => {
    const { inputs } = this.state.detector;
    const newDetector: Detector = {
      ...this.state.detector,
      inputs: [
        {
          detector_input: {
            ...inputs[0].detector_input,
            description: description,
          },
        },
        ...inputs.slice(1),
      ],
    };
    this.updateDetectorCreationState(newDetector);
  };

  onDetectorInputIndicesChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const detectorIndices = selectedOptions.map((selectedOption) => selectedOption.label);

    const { inputs } = this.state.detector;
    const newDetector: Detector = {
      ...this.state.detector,
      inputs: [
        {
          detector_input: {
            ...inputs[0].detector_input,
            indices: detectorIndices,
          },
        },
        ...inputs.slice(1),
      ],
    };

    this.updateDetectorCreationState(newDetector);
    this.context.metrics.detectorMetricsManager.sendMetrics(CreateDetectorSteps.sourceSelected);
  };

  onDetectorTypeChange = (detectorType: string) => {
    const newDetector: Detector = {
      ...this.state.detector,
      detector_type: detectorType,
      threat_intel_enabled: this.standardLogTypes.has(detectorType),
    };

    this.updateDetectorCreationState(newDetector);
    this.context.metrics.detectorMetricsManager.sendMetrics(
      CreateDetectorSteps.logTypeConfigured,
      detectorType
    );
  };

  onThreatIntelligenceChanged = (checked: boolean) => {
    const newTriggers = this.state.detector.triggers.map((trigger) => ({
      ...trigger,
      detection_types: checked
        ? addDetectionType(trigger, 'threat_intel')
        : removeDetectionType(trigger, 'threat_intel'),
    }));

    const newDetector: Detector = {
      ...this.state.detector,
      threat_intel_enabled: checked,
      triggers: newTriggers,
    };

    this.updateDetectorCreationState(newDetector);
    this.context.metrics.detectorMetricsManager.sendMetrics(
      CreateDetectorSteps.threatIntelConfigured
    );
  };

  onDetectorScheduleChange = (schedule: PeriodSchedule) => {
    const newDetector: Detector = {
      ...this.state.detector,
      schedule,
    };

    this.updateDetectorCreationState(newDetector);
  };

  render() {
    const {
      isEdit,
      fieldMappings,
      fieldMappingService,
      rulesState,
      replaceFieldMappings,
    } = this.props;
    const { detector } = this.state;
    const { name, inputs, detector_type, threat_intel_enabled } = this.props.detector;
    const { description, indices } = inputs[0].detector_input;
    const configureFieldMappingProps: ConfigureFieldMappingProps = {
      ...this.props,
      detector,
      loading: false,
      isEdit,
      fieldMappingService: fieldMappingService,
      fieldMappings: fieldMappings,
      enabledRules: rulesState.allRules.filter((rule) => rule.enabled),
      replaceFieldMappings: replaceFieldMappings,
    };

    return (
      <ContentPanel
        title={`${isEdit ? 'Edit' : 'Define'} detector`}
        subTitleText={
          'Configure your detector to identify relevant security findings and potential threats from your log data.'
        }
      >
        <EuiSpacer size={'m'} />

        <DetectorBasicDetailsForm
          {...this.props}
          detectorName={name}
          detectorDescription={description}
          onDetectorNameChange={this.onDetectorNameChange}
          onDetectorInputDescriptionChange={this.onDetectorInputDescriptionChange}
        />

        <EuiSpacer size={'m'} />

        <DetectorDataSource
          {...this.props}
          detector_type={detector_type}
          detectorIndices={indices}
          fieldMappingService={fieldMappingService}
          onDetectorInputIndicesChange={this.onDetectorInputIndicesChange}
        />

        <EuiSpacer size={'l'} />

        <DetectorType
          detectorType={detector_type}
          rulesState={this.props.rulesState}
          loadingRules={this.props.loadingRules}
          configureFieldMappingProps={configureFieldMappingProps}
          onDetectorTypeChange={this.onDetectorTypeChange}
          onAllRulesToggle={this.props.onAllRulesToggle}
          onPageChange={this.props.onPageChange}
          onRuleToggle={this.props.onRuleToggle}
        />

        <EuiSpacer size={'m'} />

        {this.standardLogTypes.has(detector_type) && (
          <ThreatIntelligence
            threatIntelChecked={threat_intel_enabled}
            onThreatIntelChange={this.onThreatIntelligenceChanged}
          />
        )}

        {logTypesWithDashboards.has(detector_type) ? (
          <>
            <EuiCallOut
              title={'Detector dashboard will be created to visualize insights for this detector'}
            >
              <p>
                A detector dashboard will be automatically created to provide insights for this
                detector.
              </p>
            </EuiCallOut>

            <EuiSpacer size={'m'} />
          </>
        ) : null}

        <EuiSpacer size={'m'} />

        <DetectorSchedule
          detector={detector}
          onDetectorScheduleChange={this.onDetectorScheduleChange}
        />
      </ContentPanel>
    );
  }
}
