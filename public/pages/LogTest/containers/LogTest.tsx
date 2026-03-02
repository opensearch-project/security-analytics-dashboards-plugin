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
import { LogTestResponse } from '../../../../types';
import {
    LogTestForm,
    LogTestFormData,
    LogTestFormErrors,
} from '../components/LogTestForm';
import { LogTestResult } from '../components/LogTestResult';

const INITIAL_FORM_DATA: LogTestFormData = {
    queue: undefined,
    location: '',
    event: '',
    traceLevel: 'NONE',
    agentMetadata: {
        groups: '',
        hostArchitecture: '',
        hostHostname: '',
        hostOsName: '',
        hostOsPlatform: '',
        hostOsType: '',
        hostOsVersion: '',
        id: '',
        name: '',
        version: '',
    },
};

const INITIAL_ERRORS: LogTestFormErrors = {};

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

        if (formData.queue === undefined || formData.queue < 1 || formData.queue > 255) {
            newErrors.queue = 'Queue is required and must be a number between 1 and 255';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (!formData.event.trim()) {
            newErrors.event = 'Log event is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const buildAgentMetadata = useCallback((): Record<string, object> => {
        const { agentMetadata } = formData;

        const {
            groups,
            hostArchitecture,
            hostHostname,
            hostOsName,
            hostOsPlatform,
            hostOsType,
            hostOsVersion,
            id,
            name,
            version,
        } = agentMetadata || {};

        // safely build the agent metadata object
        const wazuhAgent = {
            ...(groups && { groups }),
            ...(id && { id }),
            ...(name && { name }),
            ...(version && { version }),
            ...(hostArchitecture || hostHostname || hostOsName || hostOsPlatform || hostOsType || hostOsVersion
                ? {
                    host: {
                        ...(hostArchitecture && { architecture: hostArchitecture }),
                        ...(hostHostname && { hostname: hostHostname }),
                        ...(hostOsName || hostOsPlatform || hostOsType || hostOsVersion
                            ? {
                                os: {
                                    ...(hostOsName && { name: hostOsName }),
                                    ...(hostOsPlatform && { platform: hostOsPlatform }),
                                    ...(hostOsType && { type: hostOsType }),
                                    ...(hostOsVersion && { version: hostOsVersion }),
                                },
                            }
                            : {}),
                    },
                }
                : {}),
        };

        return Object.keys(wazuhAgent).length
            ? { wazuh: { agent: wazuhAgent } }
            : {};
    }, [formData]);

    const handleExecuteLogTest = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        const agentMetadata = buildAgentMetadata();

        const result = await DataStore.logTests.executeLogTest({
            document: {
                queue: formData.queue!,
                location: formData.location.trim(),
                event: formData.event.trim(),
                trace_level: formData.traceLevel,
                ...({
                    agent_metadata: agentMetadata,
                }),
            },
            integrationId: '',
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

    const handleAgentMetadataChange = useCallback(
        (field: keyof LogTestFormData['agentMetadata'], value: string) => {
            setFormData((prev) => ({
                ...prev,
                agentMetadata: {
                    ...prev.agentMetadata,
                    [field]: value,
                },
            }));
        },
        []
    );

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
                        onAgentMetadataChange={handleAgentMetadataChange}
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
                            <EuiButton
                                iconType="broom"
                                onClick={handleClearSession}
                                disabled={isLoading}
                            >
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
