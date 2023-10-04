/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiTitle, EuiText, EuiCallOut } from '@elastic/eui';
import { PeriodSchedule } from '../../../../../../models/interfaces';
import DetectorBasicDetailsForm from '../components/DetectorDetails';
import DetectorDataSource from '../components/DetectorDataSource';
import DetectorType from '../components/DetectorType';
import { EuiComboBoxOptionOption } from '@opensearch-project/oui';
import { FieldMappingService, IndexService } from '../../../../../services';
import { MIN_NUM_DATA_SOURCES } from '../../../../Detectors/utils/constants';
import { DetectorSchedule } from '../components/DetectorSchedule/DetectorSchedule';
import { RuleItem } from '../components/DetectionRules/types/interfaces';
import { CreateDetectorRulesState } from '../components/DetectionRules/DetectionRules';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { logTypesWithDashboards } from '../../../../../utils/constants';
import ConfigureFieldMapping from '../../ConfigureFieldMapping';
import { Detector, DetectorCreationStep, FieldMapping } from '../../../../../../types';

interface DefineDetectorProps extends RouteComponentProps {
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
  };

  onDetectorTypeChange = (detectorType: string) => {
    const newDetector: Detector = {
      ...this.state.detector,
      detector_type: detectorType,
    };

    this.updateDetectorCreationState(newDetector);
  };

  onPrepackagedRulesChanged = (enabledRuleIds: string[]) => {
    const { inputs } = this.state.detector;
    const newDetector: Detector = {
      ...this.state.detector,
      inputs: [
        {
          detector_input: {
            ...inputs[0].detector_input,
            pre_packaged_rules: enabledRuleIds.map((id) => {
              return { id };
            }),
          },
        },
        ...inputs.slice(1),
      ],
    };

    this.updateDetectorCreationState(newDetector);
  };

  onCustomRulesChanged = (enabledRuleIds: string[]) => {
    const { inputs } = this.state.detector;
    const newDetector: Detector = {
      ...this.state.detector,
      inputs: [
        {
          detector_input: {
            ...inputs[0].detector_input,
            custom_rules: enabledRuleIds.map((id) => {
              return { id };
            }),
          },
        },
        ...inputs.slice(1),
      ],
    };

    this.updateDetectorCreationState(newDetector);
  };

  onDetectorScheduleChange = (schedule: PeriodSchedule) => {
    const newDetector: Detector = {
      ...this.state.detector,
      schedule,
    };

    this.updateDetectorCreationState(newDetector);
  };

  render() {
    const { isEdit, fieldMappingService } = this.props;
    const { detector } = this.state;
    const { name, inputs, detector_type } = this.props.detector;
    const { description, indices } = inputs[0].detector_input;

    return (
      <div>
        <EuiTitle size={'m'}>
          <h3>{`${isEdit ? 'Edit' : 'Define'} detector`}</h3>
        </EuiTitle>

        <EuiText size="s" color="subdued">
          Configure your detector to identify relevant security findings and potential threats from
          your log data.
        </EuiText>

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

        <EuiSpacer size={'m'} />

        <DetectorType
          detectorType={detector_type}
          onDetectorTypeChange={this.onDetectorTypeChange}
          rulesState={this.props.rulesState}
          loadingRules={this.props.loadingRules}
          onAllRulesToggle={this.props.onAllRulesToggle}
          onPageChange={this.props.onPageChange}
          onRuleToggle={this.props.onRuleToggle}
        />

        <EuiSpacer size={'m'} />

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

        <ConfigureFieldMapping
          {...this.props}
          detector={detector}
          loading={false}
          fieldMappingService={this.props.fieldMappingService}
          fieldMappings={this.props.fieldMappings}
          enabledRules={this.props.rulesState.allRules.filter((rule) => rule.enabled)}
          replaceFieldMappings={this.props.replaceFieldMappings}
        />

        <EuiSpacer size={'m'} />

        <DetectorSchedule
          detector={detector}
          onDetectorScheduleChange={this.onDetectorScheduleChange}
        />
      </div>
    );
  }
}
