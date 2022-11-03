/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../../../components/ContentPanel';
import React from 'react';
import { EuiFormRow, EuiSelect, EuiSelectOption } from '@elastic/eui';
import FormFieldHeader from '../../../../../../components/FormFieldHeader';
import { Detector, PeriodSchedule } from '../../../../../../../models/interfaces';
import { Interval } from './Interval';
import { CustomCron } from './CustomCron';
import { Daily } from './Daily';
import { Monthly } from './Monthly';
import { Weekly } from './Weekly';

const frequencies: EuiSelectOption[] = [
  { value: 'interval', text: 'By interval' },
  // { value: 'daily', text: 'Daily' },
  // { value: 'weekly', text: 'Weekly' },
  // { value: 'monthly', text: 'Monthly' },
  // { value: 'cronExpression', text: 'Custom cron expression' },
];

export interface DetectorScheduleProps {
  detector: Detector;
  onDetectorScheduleChange(schedule: PeriodSchedule): void;
}

export interface DetectorScheduleState {
  selectedFrequency: string;
}

const components: { [freq: string]: typeof React.Component } = {
  daily: Daily,
  weekly: Weekly,
  monthly: Monthly,
  cronExpression: CustomCron,
  interval: Interval,
};

export class DetectorSchedule extends React.Component<
  DetectorScheduleProps,
  DetectorScheduleState
> {
  constructor(props: DetectorScheduleProps) {
    super(props);
    this.state = {
      selectedFrequency: frequencies[0].value as string,
    };
  }

  onFrequencySelected = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedFrequency: event.target.value });
  };

  render() {
    const FrequencyPicker = components[this.state.selectedFrequency];

    return (
      <ContentPanel title={'Detector schedule'}>
        <EuiFormRow label={<FormFieldHeader headerTitle={'Frequency'} />}>
          <EuiSelect
            id="overview-vis-options"
            options={frequencies}
            value={this.state.selectedFrequency}
            onChange={this.onFrequencySelected}
          />
        </EuiFormRow>

        <FrequencyPicker {...this.props} />
      </ContentPanel>
    );
  }
}
