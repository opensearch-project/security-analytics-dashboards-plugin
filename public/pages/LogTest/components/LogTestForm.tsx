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
  EuiTextArea,
  EuiAccordion,
  EuiSpacer,
  EuiSelect,
  EuiTitle,
  EuiCallOut,
} from '@elastic/eui';
import { LogTestTraceLevel } from '../../../../types';
import { MetadataEntry } from '../utils';
import { MetadataFieldsEditor } from './MetadataFieldsEditor';
import { SpaceSelector } from '../../../components/SpaceSelector/SpaceSelector';

const TRACE_LEVEL_OPTIONS: Array<{ value: LogTestTraceLevel; text: string }> = [
  { value: 'NONE', text: 'None' },
  { value: 'ASSET_ONLY', text: 'Asset only' },
  { value: 'ALL', text: 'All' },
];

const LOG_TEST_SPACE_OPTIONS = ['test', 'custom', 'standard'];

export interface LogTestIntegrationOption {
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
  integration: string;
}

export interface LogTestFormErrors {
  queue?: string;
  event?: string;
  space?: string;
  integration?: string;
}

export interface LogTestFormProps {
  formData: LogTestFormData;
  errors: LogTestFormErrors;
  onFormChange: (field: keyof LogTestFormData, value: any) => void;
  onMetadataFieldsChange: (fields: MetadataEntry[]) => void;
  integrationOptions: LogTestIntegrationOption[];
  disabledSpaces?: string[];
  disabled?: boolean;
}

export const LogTestForm: React.FC<LogTestFormProps> = ({
  formData,
  errors,
  onFormChange,
  onMetadataFieldsChange,
  integrationOptions,
  disabledSpaces = [],
  disabled = false,
}) => {

  const integrationSelectOptions = [
    { value: '', text: 'Select an integration' },
    ...integrationOptions.map((option) => ({
      value: option.id,
      text: option.label,
    })),
  ];

  return (
    <>
      <EuiTitle size="xs">
        <h3>Normalization</h3>
      </EuiTitle>
      <EuiSpacer size="s" />
      <SpaceSelector
        selectedSpace={formData.space}
        onSpaceChange={(id) => onFormChange('space', id)}
        isDisabled={disabled}
        allowedSpaces={LOG_TEST_SPACE_OPTIONS}
      />
      {disabledSpaces.includes(formData.space) && (
        <>
          <EuiSpacer size="s" />
          <EuiCallOut size="s" color="warning" iconType="alert"
            title="This space is disabled. Log test execution will fail."
          />
        </>
      )}
      <EuiSpacer size="m" />
      <EuiFlexGroup gutterSize="m" wrap>
        <EuiFlexItem style={{ minWidth: '300px' }}>
          <EuiFormRow
            label={
              <>
                {'Location - '}
                <em>optional</em>
              </>
            }
            fullWidth
          >
            <EuiFieldText
              value={formData.location}
              onChange={(e) => onFormChange('location', e.target.value)}
              placeholder="/var/log/auth.log"
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

      <EuiSpacer size="l" />

      <EuiTitle size="xs">
        <h3>Detection</h3>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem style={{ minWidth: '300px' }}>
          <EuiFormRow
            label={
              <>
                {'Integration - '}
                <em>optional</em>
              </>
            }
            fullWidth
          >
            <EuiSelect
              options={integrationSelectOptions}
              value={formData.integration}
              onChange={(e) => onFormChange('integration', e.target.value)}
              disabled={disabled || integrationSelectOptions.length <= 1}
              fullWidth
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />

      <EuiTitle size="xs">
        <h3>Log event</h3>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiFormRow isInvalid={!!errors.event} error={errors.event} fullWidth>
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
