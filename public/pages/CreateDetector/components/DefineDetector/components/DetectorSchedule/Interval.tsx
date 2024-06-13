/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
  EuiSelectOption,
} from '@elastic/eui';
import FormFieldHeader from '../../../../../../components/FormFieldHeader';
import React from 'react';
import { PeriodSchedule } from '../../../../../../../models/interfaces';
import { DetectorSchedule } from '../../../../../../../types';

export interface IntervalProps {
  detector: { schedule: DetectorSchedule };
  label?: string;
  onDetectorScheduleChange(schedule: PeriodSchedule): void;
}

export interface IntervalState {
  isIntervalValid: boolean;
}

const unitOptions: EuiSelectOption[] = [
  { value: 'MINUTES', text: 'Minutes' },
  { value: 'HOURS', text: 'Hours' },
  { value: 'DAYS', text: 'Days' },
];

export class Interval extends React.Component<IntervalProps, IntervalState> {
  state = {
    isIntervalValid: true,
  };

  onTimeIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      isIntervalValid: !!event.target.value,
    });
    this.props.onDetectorScheduleChange({
      period: {
        ...this.props.detector.schedule.period,
        interval: parseInt(event.target.value),
      },
    });
  };

  onUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onDetectorScheduleChange({
      period: {
        ...this.props.detector.schedule.period,
        unit: event.target.value,
      },
    });
  };

  render() {
    const { isIntervalValid } = this.state;
    const { period } = this.props.detector.schedule;
    return (
      <EuiFormRow
        label={<FormFieldHeader headerTitle={this.props.label ?? 'Run every'} />}
        isInvalid={!isIntervalValid}
        error={'Enter schedule interval.'}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFieldNumber
              min={1}
              icon={'clock'}
              value={period.interval}
              onChange={this.onTimeIntervalChange}
              data-test-subj={'detector-schedule-number-select'}
              required={true}
              isInvalid={!isIntervalValid}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSelect
              options={unitOptions}
              onChange={this.onUnitChange}
              value={period.unit}
              data-test-subj={'detector-schedule-unit-select'}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    );
  }
}
