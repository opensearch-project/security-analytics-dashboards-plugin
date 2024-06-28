/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { PeriodSchedule } from '../../../../../../../models/interfaces';
import { Interval } from './Interval';
import { Detector } from '../../../../../../../types';
import FormFieldHeader from '../../../../../../components/FormFieldHeader';

export interface DetectorScheduleProps {
  detector: Detector;
  onDetectorScheduleChange(schedule: PeriodSchedule): void;
}

export class DetectorSchedule extends React.Component<DetectorScheduleProps> {
  constructor(props: DetectorScheduleProps) {
    super(props);
  }

  render() {
    return (
      <>
        <EuiTitle size="m">
          <h3>Detector schedule</h3>
        </EuiTitle>
        <EuiSpacer />
        <Interval
          schedule={this.props.detector.schedule}
          label={<FormFieldHeader headerTitle={'Run every'} />}
          onScheduleChange={this.props.onDetectorScheduleChange}
        />
      </>
    );
  }
}
