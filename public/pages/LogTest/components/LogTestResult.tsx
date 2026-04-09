/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useMemo } from 'react';
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
import {
  LogTestResponse,
  LogTestAssetTrace,
  LogTestMatchedRule,
  LogTestResult as LogTestResultType,
  LogTestValidationError,
} from '../../../../types';

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
        <EuiCodeBlock language="text" paddingSize="s" fontSize="s" isCopyable>
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

const MatchedRuleItem: React.FC<{ rule: LogTestMatchedRule; index: number }> = ({
  rule,
  index,
}) => {
  const ruleId = rule.id ?? rule.rule_id ?? '';
  const ruleName = rule.title ?? rule.name ?? ruleId ?? `Rule ${index + 1}`;
  const level = rule.level ?? rule.severity ?? '';

  return (
    <EuiAccordion
      id={`matched-rule-${index}`}
      buttonContent={
        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiBadge color="hollow">{level || 'Level not available'}</EuiBadge>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="s">
              <strong>{ruleName}</strong>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      paddingSize="s"
    >
      <EuiCodeBlock language="json" paddingSize="s" fontSize="s" isCopyable overflowHeight={220}>
        {JSON.stringify(rule, null, 2)}
      </EuiCodeBlock>
    </EuiAccordion>
  );
};

const ValidationErrorItem: React.FC<{ error: LogTestValidationError; index: number }> = ({
  error,
  index,
}) => {
  const listItems = Object.entries(error)
    .filter(([, value]) => value != null)
    .map(([key, value]) => ({
      title: <span style={{ textTransform: 'capitalize' }}>{key}</span>,
      description: String(value),
    }));

  return (
    <EuiAccordion
      id={`validation-error-${index}`}
      initialIsOpen={false}
      buttonContent={
        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiBadge color="danger">{error.kind}</EuiBadge>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="s">
              <code>{error.path}</code>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      paddingSize="none"
    >
      <div style={{ padding: '8px 12px 4px' }}>
        <EuiPanel color="subdued" paddingSize="s" hasShadow={false} hasBorder={false}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', rowGap: 8 }}>
            {listItems.map(({ title, description }, i) => (
              <React.Fragment key={i}>
                <EuiText size="s"><strong>{title}</strong></EuiText>
                <EuiText size="s">{description}</EuiText>
              </React.Fragment>
            ))}
          </div>
        </EuiPanel>
      </div>
    </EuiAccordion>
  );
};

export const LogTestResult: React.FC<LogTestResultProps> = ({ result }) => {
  const parsedMessage: LogTestResultType = useMemo(() => {
    if (!result?.message) return null;
    try {
      const parsed = result.message;
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
  const hasMatchedRules = parsedMessage?.matched_rules?.length > 0;
  const hasValidation = parsedMessage?.validation != null;

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
          <EuiCodeBlock language="json" paddingSize="m" isCopyable overflowHeight={400}>
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
          <EuiAccordion
            id="asset-traces-section"
            initialIsOpen={false}
            buttonContent={
              <EuiText size="s">
                <h4>Asset Traces</h4>
              </EuiText>
            }
            paddingSize="s"
          >
            <EuiSpacer size="s" />
            <EuiPanel paddingSize="m">
              {parsedMessage.asset_traces!.map((trace, index) => (
                <React.Fragment key={`${trace.asset}-${index}`}>
                  {index > 0 && <EuiSpacer size="s" />}
                  <AssetTraceItem trace={trace} index={index} />
                </React.Fragment>
              ))}
            </EuiPanel>
          </EuiAccordion>
        </>
      )}

      {hasMatchedRules && (
        <>
          <EuiSpacer size="l" />
          <EuiText size="s">
            <h4>Matched Rules</h4>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiPanel paddingSize="m">
            {parsedMessage.matched_rules!.map((rule, index) => (
              <React.Fragment key={`${rule.id ?? rule.rule_id ?? 'rule'}-${index}`}>
                {index > 0 && <EuiSpacer size="s" />}
                <MatchedRuleItem rule={rule} index={index} />
              </React.Fragment>
            ))}
          </EuiPanel>
        </>
      )}

      {hasValidation && !parsedMessage.validation!.valid && (
        <>
          <EuiSpacer size="l" />
          <EuiAccordion
            id="validation-section"
            initialIsOpen
            buttonContent={
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem>
                  <EuiText size="s">
                    <h4>Validation</h4>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiBadge color="danger">Failed</EuiBadge>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            paddingSize="s"
          >
            {parsedMessage.validation!.errors.length > 0 && (
              <>
                <EuiSpacer size="s" />
                <EuiPanel paddingSize="m">
                  {parsedMessage.validation!.errors.map((error, index) => (
                    <React.Fragment key={`${error.path}-${error.kind}-${index}`}>
                      {index > 0 && <EuiSpacer size="s" />}
                      <ValidationErrorItem error={error} index={index} />
                    </React.Fragment>
                  ))}
                </EuiPanel>
              </>
            )}
          </EuiAccordion>
        </>
      )}
    </>
  );
};
