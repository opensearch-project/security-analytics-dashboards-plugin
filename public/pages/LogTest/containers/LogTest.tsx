/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiButton,
  EuiHorizontalRule,
} from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { setBreadcrumbs } from '../../../utils/helpers';
import { BREADCRUMBS } from '../../../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { SpaceTypes } from '../../../../common/constants';
import { LogTestResponse } from '../../../../types';
import {
  LogTestForm,
  LogTestFormData,
  LogTestFormErrors,
  LogTestSpaceOption,
} from '../components/LogTestForm';
import { LogTestResult } from '../components/LogTestResult';
import { MetadataEntry, buildMetadataObject } from '../utils';

const INITIAL_FORM_DATA: LogTestFormData = {
  queue: undefined,
  location: '',
  event: '',
  traceLevel: 'NONE',
  space: '',
  metadataFields: [],
};

const INITIAL_ERRORS: LogTestFormErrors = {};

const spaceOptions: LogTestSpaceOption[] = [
  { id: SpaceTypes.TEST.value, label: SpaceTypes.TEST.label },
  { id: SpaceTypes.STANDARD.value, label: SpaceTypes.STANDARD.label },
];

export const LogTest: React.FC<RouteComponentProps> = () => {
  const [formData, setFormData] = useState<LogTestFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<LogTestFormErrors>(INITIAL_ERRORS);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<LogTestResponse | null>(null);

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.LOG_TEST]);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: LogTestFormErrors = {};

    // if (formData.queue === undefined || formData.queue < 1 || formData.queue > 255) {
    //     newErrors.queue = 'Queue is required and must be a number between 1 and 255';
    // }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.event.trim()) {
      newErrors.event = 'Log event is required';
    }

    if (!formData.space) {
      newErrors.space = 'Space is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleExecuteLogTest = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const metadata = buildMetadataObject(formData.metadataFields);

    const result = await DataStore.logTests.executeLogTest({
      document: {
        queue: 1, // temporary hardcoded queue value
        location: formData.location.trim(),
        event: formData.event.trim(),
        trace_level: formData.traceLevel,
        ...{
          metadata,
        },
        space: formData.space,
      },
    });

    setIsLoading(false);

    if (result.success && result.data) {
      setTestResult(result.data);
    }
  };

  const handleFormChange = useCallback(
    (field: keyof LogTestFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // clears error when user starts typing
      if (errors[field as keyof LogTestFormErrors]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof LogTestFormErrors];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleMetadataFieldsChange = useCallback((fields: MetadataEntry[]) => {
    setFormData((prev) => ({ ...prev, metadataFields: fields }));
  }, []);

  const handleClearSession = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors(INITIAL_ERRORS);
    setTestResult(null);
  }, []);

  return (
    <EuiFlexGroup direction="column" gutterSize="m">
      <EuiFlexItem grow={false}>
        <PageHeader>
          <EuiText size="s">
            <h1>Log Test</h1>
          </EuiText>
        </PageHeader>
      </EuiFlexItem>

      <EuiSpacer size="m" />

      <EuiFlexItem>
        <EuiPanel>
          <LogTestForm
            formData={formData}
            errors={errors}
            onFormChange={handleFormChange}
            onMetadataFieldsChange={handleMetadataFieldsChange}
            spaceOptions={spaceOptions}
            disabled={isLoading}
          />

          <EuiSpacer size="l" />

          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                iconType="play"
                onClick={handleExecuteLogTest}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Testing...' : 'Test'}
              </EuiButton>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton iconType="broom" onClick={handleClearSession} disabled={isLoading}>
                Clear session
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>

          {testResult && (
            <>
              <EuiHorizontalRule margin="l" />
              <LogTestResult result={testResult} />
            </>
          )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
