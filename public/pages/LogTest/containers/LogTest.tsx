/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { NotificationsStart } from 'opensearch-dashboards/public';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { errorNotificationToast, setBreadcrumbs } from '../../../utils/helpers';
import { BREADCRUMBS } from '../../../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { SpaceTypes } from '../../../../common/constants';
import { LogTestResponse } from '../../../../types';
import {
  LogTestForm,
  LogTestFormData,
  LogTestFormErrors,
  LogTestSpaceOption,
  LogTestIntegrationOption,
} from '../components/LogTestForm';
import { LogTestResult } from '../components/LogTestResult';
import { MetadataEntry, buildMetadataObject } from '../utils';

const INITIAL_FORM_DATA: LogTestFormData = {
  queue: undefined,
  location: '',
  event: '',
  traceLevel: 'NONE',
  space: SpaceTypes.STANDARD.value,
  metadataFields: [],
  integration: '',
};

const INITIAL_ERRORS: LogTestFormErrors = {};

const INITIAL_SPACE_OPTIONS: LogTestSpaceOption[] = [
  { id: SpaceTypes.STANDARD.value, label: SpaceTypes.STANDARD.label },
  { id: SpaceTypes.TEST.value, label: SpaceTypes.TEST.label },
];

interface SpaceCacheEntry {
  enabled: boolean;
  integrations: LogTestIntegrationOption[];
}

type SpaceCache = Record<string, SpaceCacheEntry>;

interface LogTestProps extends RouteComponentProps {
  notifications?: NotificationsStart;
}

export const LogTest: React.FC<LogTestProps> = ({ notifications }) => {
  const [formData, setFormData] = useState<LogTestFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<LogTestFormErrors>(INITIAL_ERRORS);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<LogTestResponse | null>(null);
  const [spaceCache, setSpaceCache] = useState<SpaceCache>({});

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.LOG_TEST]);
  }, []);

  const loadSpaceCache = useCallback(async (): Promise<SpaceCache> => {
    const entries = await Promise.all(
      INITIAL_SPACE_OPTIONS.map((option) =>
        DataStore.policies
          .searchPolicies(option.id, {
            includeIntegrationFields: ['document.id', 'document.metadata', 'document.enabled'],
          })
          .then((response): [string, SpaceCacheEntry] => {
            const policy = response.items[0];
            const integrations: LogTestIntegrationOption[] = Object.values(
              policy?.integrationsMap ?? {}
            )
              .filter((i) => i.document?.enabled)
              .map((i) => ({
                id: i.document?.id,
                label: i.document?.metadata?.title ?? i.document?.id,
              }));
            return [
              option.id,
              {
                enabled: !!policy && policy.document?.enabled !== false,
                integrations,
              },
            ];
          })
          .catch((error): [string, SpaceCacheEntry] => {
            console.error(`Security Analytics - LogTest - searchPolicies (${option.id}):`, error);
            errorNotificationToast(notifications, 'retrieve', 'policies', error);
            return [option.id, { enabled: false, integrations: [] }];
          })
      )
    );

    const cache: SpaceCache = Object.fromEntries(entries);
    setSpaceCache(cache);
    setFormData((prev) => {
      if (cache[prev.space]?.enabled) return prev;
      const firstEnabledId = INITIAL_SPACE_OPTIONS.find((o) => cache[o.id]?.enabled)?.id;
      if (!firstEnabledId || firstEnabledId === prev.space) return prev;
      return { ...prev, space: firstEnabledId, integration: '' };
    });
    return cache;
  }, [notifications]);

  useEffect(() => {
    loadSpaceCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFormData((prev) => (prev.integration ? { ...prev, integration: '' } : prev));
  }, [formData.space]);

  const spaceOptions = useMemo<LogTestSpaceOption[]>(
    () =>
      INITIAL_SPACE_OPTIONS.map((option) => {
        const isEnabled = spaceCache[option.id]?.enabled ?? false;
        return {
          ...option,
          disabled: !isEnabled,
          title: !isEnabled
            ? `The "${option.label}" space is disabled , please enable it`
            : undefined,
        };
      }),
    [spaceCache]
  );

  const integrationOptions = useMemo<LogTestIntegrationOption[]>(
    () => spaceCache[formData.space]?.integrations ?? [],
    [spaceCache, formData.space]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: LogTestFormErrors = {};

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

    const result = await DataStore.logTests.executeLogTest({
      document: {
        queue: 1, // temporary hardcoded queue value
        location: String(formData.location ?? '').trim(),
        event: formData.event.trim(),
        trace_level: formData.traceLevel,
        metadata: buildMetadataObject(formData.metadataFields),
        space: formData.space,
        integration: formData.integration || undefined,
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
            integrationOptions={integrationOptions}
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
