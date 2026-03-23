/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiFieldNumber,
  EuiTextArea,
  EuiAccordion,
  EuiSpacer,
  EuiSelect,
} from '@elastic/eui';
import { LogTestTraceLevel } from '../../../../types';
import { MetadataEntry } from '../utils';
import { MetadataFieldsEditor } from './MetadataFieldsEditor';

const TRACE_LEVEL_OPTIONS: Array<{ value: LogTestTraceLevel; text: string }> = [
  { value: 'NONE', text: 'None' },
  { value: 'ASSET_ONLY', text: 'Asset only' },
  { value: 'ALL', text: 'All' },
];

export interface LogTestSpaceOption {
  id: string;
  label: string;
}

export interface LogTestFormData {
  queue: number | undefined;
  location: string;
  event: string;
  traceLevel: LogTestTraceLevel;
  space: string;
  metadataFields: MetadataEntry[];
}

export interface LogTestFormErrors {
  queue?: string;
  location?: string;
  event?: string;
  space?: string;
}

export interface LogTestFormProps {
  formData: LogTestFormData;
  errors: LogTestFormErrors;
  onFormChange: (field: keyof LogTestFormData, value: any) => void;
  onMetadataFieldsChange: (fields: MetadataEntry[]) => void;
  spaceOptions: LogTestSpaceOption[];
  disabled?: boolean;
}

export const LogTestForm: React.FC<LogTestFormProps> = ({
  formData,
  errors,
  onFormChange,
  onMetadataFieldsChange,
  spaceOptions,
  disabled = false,
}) => {
  const spaceSelectOptions = [
    ...spaceOptions.map((option) => ({ value: option.id, text: option.label })),
  ];

  return (
    <>
      <EuiFlexGroup gutterSize="m" wrap>
        {/* <EuiFlexItem style={{ minWidth: '300px' }}>
                    <EuiFormRow
                        label="Queue"
                        isInvalid={!!errors.queue}
                        error={errors.queue}
                        fullWidth
                    >
                        <EuiFieldNumber
                            value={formData.queue ?? ''}
                            onChange={(e) =>
                                onFormChange(
                                    'queue',
                                    e.target.value ? Number(e.target.value) : undefined
                                )
                            }
                            min={1}
                            max={255}
                            isInvalid={!!errors.queue}
                            disabled={disabled}
                            fullWidth
                        />
                    </EuiFormRow>
                </EuiFlexItem> */}
        <EuiFlexItem style={{ minWidth: '300px' }}>
          <EuiFormRow
            label="Location"
            isInvalid={!!errors.location}
            error={errors.location}
            fullWidth
          >
            <EuiFieldText
              value={formData.location}
              onChange={(e) => onFormChange('location', e.target.value)}
              placeholder="/var/log/auth.log"
              isInvalid={!!errors.location}
              disabled={disabled}
              fullWidth
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '200px' }}>
          <EuiFormRow label="Trace level" fullWidth>
            <EuiSelect
              options={TRACE_LEVEL_OPTIONS}
              value={formData.traceLevel}
              onChange={(e) => onFormChange('traceLevel', e.target.value as LogTestTraceLevel)}
              disabled={disabled}
              fullWidth
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '280px' }}>
          <EuiFormRow label="Space" isInvalid={!!errors.space} error={errors.space} fullWidth>
            <EuiSelect
              options={spaceSelectOptions}
              value={formData.space}
              onChange={(e) => onFormChange('space', e.target.value)}
              isInvalid={!!errors.space}
              disabled={disabled || spaceSelectOptions.length === 0}
              fullWidth
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiAccordion
        id="agent-metadata-accordion"
        buttonContent="Metadata (optional)"
        paddingSize="m"
      >
        <EuiSpacer size="s" />
        <MetadataFieldsEditor
          entries={formData.metadataFields}
          onChange={onMetadataFieldsChange}
          disabled={disabled}
        />
      </EuiAccordion>
      <EuiSpacer size="m" />
      <EuiFormRow label="Log event" isInvalid={!!errors.event} error={errors.event} fullWidth>
        <EuiTextArea
          placeholder="Enter log data to test..."
          value={formData.event}
          onChange={(e) => onFormChange('event', e.target.value)}
          rows={6}
          isInvalid={!!errors.event}
          disabled={disabled}
          fullWidth
        />
      </EuiFormRow>
    </>
  );
};
