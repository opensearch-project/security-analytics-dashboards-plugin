/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiDatePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
} from '@elastic/eui';
import React from 'react';
import moment, { Moment } from 'moment';
import FormFieldHeader from '../../../../../../components/FormFieldHeader';

export interface DailyProps {}

export interface DailyState {
  selectedTime?: number;
  selectedTimeZone?: string;
  invalidTimeMessage?: string;
  invalidTimeZoneMessage?: string;
}

const timezones = moment.tz.names().map((tz) => ({ label: tz }));

export class Daily extends React.Component<DailyProps, DailyState> {
  constructor(props: DailyProps) {
    super(props);
    this.state = {
      selectedTime: 0,
    };
  }

  onTimeSelect = (date: Moment) => {
    if (date) {
      this.setState({ selectedTime: date.hours(), invalidTimeMessage: undefined });
    } else {
      this.setState({ invalidTimeMessage: 'Invalid time selected.', selectedTime: undefined });
    }
  };

  onTimeZoneSelect = (options: EuiComboBoxOptionOption<string>[]) => {
    this.setState(
      options.length > 0
        ? { selectedTimeZone: options[0].label, invalidTimeMessage: undefined }
        : { invalidTimeZoneMessage: 'Select a timezone.', selectedTimeZone: undefined }
    );
  };

  render() {
    const {
      selectedTime,
      selectedTimeZone,
      invalidTimeMessage,
      invalidTimeZoneMessage,
    } = this.state;
    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFormRow
            label={<FormFieldHeader headerTitle={'Around'} />}
            isInvalid={!!invalidTimeMessage}
            error={invalidTimeMessage}
          >
            <EuiDatePicker
              showTimeSelect
              showTimeSelectOnly
              selected={
                selectedTime !== undefined ? moment().hours(selectedTime).minutes(0) : undefined
              }
              onChange={this.onTimeSelect}
              dateFormat="hh:mm A"
              timeIntervals={60}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow isInvalid={!!invalidTimeZoneMessage} error={invalidTimeZoneMessage}>
            <EuiComboBox
              placeholder="Select a timezone"
              options={timezones}
              renderOption={({ label: tz }) => `${tz} (${moment.tz(tz).format('Z')})`}
              singleSelection={true}
              selectedOptions={selectedTimeZone ? [{ label: selectedTimeZone }] : undefined}
              onChange={this.onTimeZoneSelect}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
