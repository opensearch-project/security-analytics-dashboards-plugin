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
import React from 'react';
import { PeriodSchedule } from '../../../../../../../models/interfaces';
import { defaultIntervalUnitOptions } from '../../../../../../utils/constants';

export interface IntervalProps {
  schedule: PeriodSchedule;
  label?: string | React.ReactNode;
  readonly?: boolean;
  scheduleUnitOptions?: EuiSelectOption[];
  onScheduleChange(schedule: PeriodSchedule): void;
}

export interface IntervalState {
  isIntervalValid: boolean;
}

export class Interval extends React.Component<IntervalProps, IntervalState> {
  state = {
    isIntervalValid: Number.isInteger(this.props.schedule.period.interval),
  };

  onTimeIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      isIntervalValid: !!event.target.value,
    });
    this.props.onScheduleChange({
      period: {
        ...this.props.schedule.period,
        interval: parseInt(event.target.value),
      },
    });
  };

  onUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onScheduleChange({
      period: {
        ...this.props.schedule.period,
        unit: event.target.value,
      },
    });
  };

  render() {
    const { isIntervalValid } = this.state;
    const { period } = this.props.schedule;
    return (
      <EuiFormRow
        label={this.props.label}
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
              readOnly={this.props.readonly}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSelect
              options={this.props.scheduleUnitOptions ?? Object.values(defaultIntervalUnitOptions)}
              onChange={this.onUnitChange}
              value={period.unit}
              data-test-subj={'detector-schedule-unit-select'}
              disabled={this.props.readonly}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    );
  }
}
