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
import { Detector, PeriodSchedule } from '../../../../../../../models/interfaces';

export interface IntervalProps {
  detector: Detector;
  onDetectorScheduleChange(schedule: PeriodSchedule): void;
}

const unitOptions: EuiSelectOption[] = [
  { value: 'MINUTES', text: 'Minutes' },
  { value: 'HOURS', text: 'Hours' },
  { value: 'DAYS', text: 'Days' },
];

export class Interval extends React.Component<IntervalProps> {
  onTimeIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const { period } = this.props.detector.schedule;
    return (
      <EuiFormRow label={<FormFieldHeader headerTitle={'Run every'} />}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFieldNumber
              min={1}
              icon={'clock'}
              value={period.interval}
              onChange={this.onTimeIntervalChange}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSelect options={unitOptions} onChange={this.onUnitChange} value={period.unit} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    );
  }
}
