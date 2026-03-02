/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useMemo, useState } from 'react';
import {
    EuiText,
    EuiCodeBlock,
    EuiSpacer,
    EuiAccordion,
    EuiBadge,
    EuiFlexGroup,
    EuiFlexItem,
    EuiPanel,
    EuiCallOut,
} from '@elastic/eui';
import { LogTestResponse, LogTestAssetTrace, LogTestResult as LogTestResultType } from '../../../../types';

export interface LogTestResultProps {
    result: LogTestResponse;
}



const AssetTraceItem: React.FC<{ trace: LogTestAssetTrace; index: number }> = ({
    trace,
    index,
}) => {
    return (
        <EuiAccordion
            id={`asset-trace-${index}`}
            buttonContent={
                <EuiFlexGroup alignItems="center" gutterSize="s">
                    <EuiFlexItem grow={false}>
                        <EuiBadge color={trace.success ? 'success' : 'danger'}>
                            {trace.success ? 'Success' : 'Failed'}
                        </EuiBadge>
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiText size="s">
                            <code>{trace.asset}</code>
                        </EuiText>
                    </EuiFlexItem>
                </EuiFlexGroup>
            }
            paddingSize="s"
        >
            {trace.traces && trace.traces.length > 0 ? (
                <EuiCodeBlock
                    language="text"
                    paddingSize="s"
                    fontSize="s"
                    isCopyable
                >
                    {trace.traces.join('\n')}
                </EuiCodeBlock>
            ) : (
                <EuiText size="s" color="subdued">
                    No trace details available
                </EuiText>
            )}
        </EuiAccordion>
    );
};

export const LogTestResult: React.FC<LogTestResultProps> = ({ result }) => {

    const parsedMessage: LogTestResultType = useMemo(() => {
        if (!result?.message) return null;
        try {
            const parsed = JSON.parse(result.message);
            const output = parsed.output;
            return { ...parsed, output };
        } catch {
            return null;
        }
    }, [result?.message]);

    const formattedOutput = useMemo(() => {
        if (parsedMessage?.output) {
            return JSON.stringify(parsedMessage.output, null, 2);
        }
        return null;
    }, [parsedMessage?.output]);


    const hasAssetTraces = parsedMessage?.asset_traces?.length > 0;


    return (
        <>
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                <EuiFlexItem grow={false}>
                    <EuiText size="s">
                        <h3>Test Result</h3>
                    </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiFlexGroup alignItems="center" gutterSize="m">
                        <EuiFlexItem grow={false}>
                            <EuiBadge color={result?.status === 'OK' ? 'success' : 'warning'}>
                                {result?.status}
                            </EuiBadge>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="m" />

            {formattedOutput ? (
                <EuiPanel paddingSize="none">
                    <EuiCodeBlock
                        language="json"
                        paddingSize="m"
                        isCopyable
                        overflowHeight={400}
                    >
                        {formattedOutput}
                    </EuiCodeBlock>
                </EuiPanel>
            ) : (
                <EuiCallOut title="No output" color="warning" iconType="alert">
                    <p>The logtest did not return any output.</p>
                </EuiCallOut>
            )}

            {hasAssetTraces && (
                <>
                    <EuiSpacer size="l" />
                    <EuiText size="s">
                        <h4>Asset Traces</h4>
                    </EuiText>
                    <EuiSpacer size="s" />
                    <EuiPanel paddingSize="m">
                        {parsedMessage.asset_traces!.map((trace, index) => (
                            <React.Fragment key={`${trace.asset}-${index}`}>
                                {index > 0 && <EuiSpacer size="s" />}
                                <AssetTraceItem trace={trace} index={index} />
                            </React.Fragment>
                        ))}
                    </EuiPanel>
                </>
            )}
        </>
    );
};
