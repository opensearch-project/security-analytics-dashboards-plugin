/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { Detector, PeriodSchedule } from '../../../../../../models/interfaces';
import DetectorBasicDetailsForm from '../components/DetectorDetails';
import DetectorDataSource from '../components/DetectorDataSource';
import DetectorType from '../components/DetectorType';
import DetectionRules from '../components/DetectionRules';
import { EuiComboBoxOptionOption } from '@opensearch-project/oui';
import { IndexService, RulesService } from '../../../../../services';
import { MIN_NUM_DATA_SOURCES } from '../../../../Detectors/utils/constants';
import { DetectorCreationStep } from '../../../models/types';
import { DetectorSchedule } from '../components/DetectorSchedule/DetectorSchedule';
import { RulesSharedState } from '../../../../../models/interfaces';

interface DefineDetectorProps extends RouteComponentProps {
  detector: Detector;
  isEdit: boolean;
  indexService: IndexService;
  rulesService: RulesService;
  rulesPageIndex: number;
  changeDetector: (detector: Detector) => void;
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
  onRulesStateChange: (state: Partial<RulesSharedState>) => void;
}

interface DefineDetectorState {}

export default class DefineDetector extends Component<DefineDetectorProps, DefineDetectorState> {
  componentDidMount = async () => {
    if (this.props.isEdit) {
      // TODO: Retrieve detector using ID, and set state.detector to the result
    }
  };

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

  onDetectorInputDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>, index = 0) => {
    const { inputs } = this.props.detector;
    const newDetector: Detector = {
      ...this.props.detector,
      inputs: [
        {
          detector_input: {
            ...inputs[0].detector_input,
            description: event.target.value,
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
    const { isEdit, detector } = this.props;
    const { name, inputs, detector_type } = this.props.detector;
    const { description, indices, pre_packaged_rules, custom_rules } = inputs[0].detector_input;
    const enabledPrePackagedRuleIds = new Set(pre_packaged_rules.map((rule) => rule.id));
    const enabledCustomRuleIds = new Set(custom_rules.map((rule) => rule.id));

    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>{`${isEdit ? 'Edit' : 'Define'} detector`}</h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        <DetectorBasicDetailsForm
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
          {...this.props}
          enabledCustomRuleIds={enabledCustomRuleIds}
          enabledPrePackagedRuleIds={enabledPrePackagedRuleIds}
          detectorType={detector_type}
          pageIndex={this.props.rulesPageIndex}
          onPrepackagedRulesChanged={this.onPrepackagedRulesChanged}
          onCustomRulesChanged={this.onCustomRulesChanged}
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
