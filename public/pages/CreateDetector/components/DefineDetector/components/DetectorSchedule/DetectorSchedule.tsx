/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSelectOption, EuiSpacer, EuiTitle } from '@elastic/eui';
import { PeriodSchedule } from '../../../../../../../models/interfaces';
import { Interval } from './Interval';
import { CustomCron } from './CustomCron';
import { Daily } from './Daily';
import { Monthly } from './Monthly';
import { Weekly } from './Weekly';
import { Detector } from '../../../../../../../types';

const frequencies: EuiSelectOption[] = [{ value: 'interval', text: 'By interval' }];

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
      <>
        <EuiTitle size="m">
          <h3>Detector schedule</h3>
        </EuiTitle>
        <EuiSpacer />
        <FrequencyPicker {...this.props} />
      </>
    );
  }
}
