/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiTitle, EuiText } from '@elastic/eui';
import { Detector, PeriodSchedule } from '../../../../../../models/interfaces';
import DetectorBasicDetailsForm from '../components/DetectorDetails';
import DetectorDataSource from '../components/DetectorDataSource';
import DetectorType from '../components/DetectorType';
import { EuiComboBoxOptionOption } from '@opensearch-project/oui';
import { IndexService } from '../../../../../services';
import { MIN_NUM_DATA_SOURCES } from '../../../../Detectors/utils/constants';
import { DetectorCreationStep } from '../../../models/types';
import { DetectorSchedule } from '../components/DetectorSchedule/DetectorSchedule';
import { RuleItem } from '../components/DetectionRules/types/interfaces';
import {
  CreateDetectorRulesState,
  DetectionRules,
} from '../components/DetectionRules/DetectionRules';
import { NotificationsStart } from 'opensearch-dashboards/public';

interface DefineDetectorProps extends RouteComponentProps {
  detector: Detector;
  isEdit: boolean;
  indexService: IndexService;
  rulesState: CreateDetectorRulesState;
  notifications: NotificationsStart;
  loadingRules?: boolean;
  changeDetector: (detector: Detector) => void;
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
  onPageChange: (page: { index: number; size: number }) => void;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
}

interface DefineDetectorState {}

export default class DefineDetector extends Component<DefineDetectorProps, DefineDetectorState> {
  updateDetectorCreationState(detector: Detector) {
    const isDataValid =
      !!detector.name &&
      !!detector.detector_type &&
      detector.inputs[0].detector_input.indices.length >= MIN_NUM_DATA_SOURCES;
    this.props.changeDetector(detector);
    this.props.updateDataValidState(DetectorCreationStep.DEFINE_DETECTOR, isDataValid);
  }

  onDetectorNameChange = (detectorName: string) => {
    const newDetector: Detector = {
      ...this.props.detector,
      name: detectorName,
    };

    this.updateDetectorCreationState(newDetector);
  };

  onDetectorInputDescriptionChange = (description: string) => {
    const { inputs } = this.props.detector;
    const newDetector: Detector = {
      ...this.props.detector,
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

    const { inputs } = this.props.detector;
    const newDetector: Detector = {
      ...this.props.detector,
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
      ...this.props.detector,
      detector_type: detectorType,
    };

    this.updateDetectorCreationState(newDetector);
  };

  onPrepackagedRulesChanged = (enabledRuleIds: string[]) => {
    const { inputs } = this.props.detector;
    const newDetector: Detector = {
      ...this.props.detector,
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
    const { inputs } = this.props.detector;
    const newDetector: Detector = {
      ...this.props.detector,
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
      ...this.props.detector,
      schedule,
    };

    this.updateDetectorCreationState(newDetector);
  };

  render() {
    const {
      isEdit,
      detector,
      rulesState,
      onRuleToggle,
      onPageChange,
      onAllRulesToggle,
    } = this.props;
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
          detectorIndices={indices}
          onDetectorInputIndicesChange={this.onDetectorInputIndicesChange}
        />

        <EuiSpacer size={'m'} />

        <DetectorType
          detectorType={detector_type}
          onDetectorTypeChange={this.onDetectorTypeChange}
        />

        <EuiSpacer size={'m'} />

        <DetectionRules
          rulesState={rulesState}
          loading={this.props.loadingRules}
          onPageChange={onPageChange}
          onRuleToggle={onRuleToggle}
          onAllRulesToggle={onAllRulesToggle}
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
