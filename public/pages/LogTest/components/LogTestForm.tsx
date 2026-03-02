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

const TRACE_LEVEL_OPTIONS: Array<{ value: LogTestTraceLevel; text: string }> = [
    { value: 'NONE', text: 'None' },
    { value: 'ASSET_ONLY', text: 'Asset only' },
    { value: 'ALL', text: 'All' },
];

export interface LogTestFormData {
    queue: number | undefined;
    location: string;
    event: string;
    traceLevel: LogTestTraceLevel;
    agentMetadata: {
        groups: string;
        hostArchitecture: string;
        hostHostname: string;
        hostOsName: string;
        hostOsPlatform: string;
        hostOsType: string;
        hostOsVersion: string;
        id: string;
        name: string;
        version: string;
    };
}

export interface LogTestFormErrors {
    queue?: string;
    location?: string;
    event?: string;
}

export interface LogTestFormProps {
    formData: LogTestFormData;
    errors: LogTestFormErrors;
    onFormChange: (field: keyof LogTestFormData, value: any) => void;
    onAgentMetadataChange: (field: keyof LogTestFormData['agentMetadata'], value: string) => void;
    disabled?: boolean;
}

export const LogTestForm: React.FC<LogTestFormProps> = ({
    formData,
    errors,
    onFormChange,
    onAgentMetadataChange,
    disabled = false,
}) => {
    return (
        <>
            <EuiFlexGroup gutterSize="m" wrap>
                <EuiFlexItem style={{ minWidth: '300px' }}>
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
                </EuiFlexItem>
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
                            onChange={(e) =>
                                onFormChange('traceLevel', e.target.value as LogTestTraceLevel)
                            }
                            disabled={disabled}
                            fullWidth
                        />
                    </EuiFormRow>
                </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />
            <EuiAccordion
                id="agent-metadata-accordion"
                buttonContent="Agent metadata (optional)"
                paddingSize="m"
            >
                <EuiSpacer size="s" />
                <EuiFlexGroup gutterSize="m" wrap>
                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.groups" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.groups}
                                onChange={(e) => onAgentMetadataChange('groups', e.target.value)}
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.host.architecture" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.hostArchitecture}
                                onChange={(e) =>
                                    onAgentMetadataChange('hostArchitecture', e.target.value)
                                }
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.host.hostname" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.hostHostname}
                                onChange={(e) =>
                                    onAgentMetadataChange('hostHostname', e.target.value)
                                }
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.host.os.name" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.hostOsName}
                                onChange={(e) =>
                                    onAgentMetadataChange('hostOsName', e.target.value)
                                }
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.host.os.platform" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.hostOsPlatform}
                                onChange={(e) =>
                                    onAgentMetadataChange('hostOsPlatform', e.target.value)
                                }
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.host.os.type" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.hostOsType}
                                onChange={(e) =>
                                    onAgentMetadataChange('hostOsType', e.target.value)
                                }
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.host.os.version" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.hostOsVersion}
                                onChange={(e) =>
                                    onAgentMetadataChange('hostOsVersion', e.target.value)
                                }
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.id" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.id}
                                onChange={(e) => onAgentMetadataChange('id', e.target.value)}
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.name" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.name}
                                onChange={(e) => onAgentMetadataChange('name', e.target.value)}
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    <EuiFlexItem style={{ minWidth: '280px' }}>
                        <EuiFormRow label="wazuh.agent.version" fullWidth>
                            <EuiFieldText
                                value={formData.agentMetadata.version}
                                onChange={(e) => onAgentMetadataChange('version', e.target.value)}
                                disabled={disabled}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiAccordion>
            <EuiSpacer size="m" />
            <EuiFormRow
                label="Log event"
                isInvalid={!!errors.event}
                error={errors.event}
                fullWidth
            >
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
