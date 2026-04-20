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
  EuiTabs,
  EuiTab,
} from '@elastic/eui';
import {
  LogTestResponse,
  LogTestAssetTrace,
  LogTestNormalizationResult,
  LogTestDetectionResult,
  LogTestDetectionRuleMatch,
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
        <EuiFlexGroup alignItems='center' gutterSize='s'>
          <EuiFlexItem grow={false}>
            <EuiBadge color={trace.success ? 'success' : 'danger'}>
              {trace.success ? 'Success' : 'Failed'}
            </EuiBadge>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size='s'>
              <code>{trace.asset}</code>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      paddingSize='s'
    >
      {trace.traces && trace.traces.length > 0 ? (
        <EuiCodeBlock language='text' paddingSize='s' fontSize='s' isCopyable>
          {trace.traces.join('\n')}
        </EuiCodeBlock>
      ) : (
        <EuiText size='s' color='subdued'>
          No trace details available
        </EuiText>
      )}
    </EuiAccordion>
  );
};

const ValidationErrorItem: React.FC<{
  error: LogTestValidationError;
  index: number;
}> = ({ error, index }) => {
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
        <EuiText size='s'>
          <code>{error.path}</code>
        </EuiText>
      }
      paddingSize='none'
    >
      <div style={{ padding: '8px 12px 4px' }}>
        <EuiPanel
          color='subdued'
          paddingSize='s'
          hasShadow={false}
          hasBorder={false}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              rowGap: 8,
            }}
          >
            {listItems.map(({ title, description }, i) => (
              <React.Fragment key={i}>
                <EuiText size='s'>
                  <strong>{title}</strong>
                </EuiText>
                <EuiText size='s'>{description}</EuiText>
              </React.Fragment>
            ))}
          </div>
        </EuiPanel>
      </div>
    </EuiAccordion>
  );
};

function getLevelBadgeColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'default';
    default:
      return 'hollow';
  }
}

const DetectionMatchItem: React.FC<{
  match: LogTestDetectionRuleMatch;
  index: number;
}> = ({ match, index }) => {
  const { rule, matched_conditions } = match;

  return (
    <EuiAccordion
      id={`detection-match-${index}`}
      buttonContent={
        <EuiFlexGroup alignItems='center' gutterSize='s'>
          <EuiFlexItem grow={false}>
            <EuiBadge color={getLevelBadgeColor(rule.level)}>
              {rule.level}
            </EuiBadge>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size='s'>
              <strong>{rule.title}</strong>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      paddingSize='s'
    >
      {rule.tags && rule.tags.length > 0 && (
        <>
          <EuiFlexGroup gutterSize='xs' wrap>
            {rule.tags.map((tag) => (
              <EuiFlexItem grow={false} key={tag}>
                <EuiBadge color='hollow'>{tag}</EuiBadge>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
          <EuiSpacer size='s' />
        </>
      )}
      {matched_conditions && matched_conditions.length > 0 && (
        <>
          <EuiText size='xs' color='subdued'>
            <strong>Matched conditions:</strong>
          </EuiText>
          <EuiSpacer size='xs' />
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {matched_conditions.map((condition, i) => (
              <li key={i}>
                <EuiText size='s'>
                  <code>{condition}</code>
                </EuiText>
              </li>
            ))}
          </ul>
        </>
      )}
    </EuiAccordion>
  );
};

const NormalizationSection: React.FC<{ data: LogTestNormalizationResult }> = ({
  data,
}) => {
  const formattedOutput = useMemo(() => {
    if (data?.output) {
      return JSON.stringify(data.output, null, 2);
    }
    return null;
  }, [data?.output]);

  const hasAssetTraces = data?.asset_traces && data.asset_traces.length > 0;
  const hasValidation = data?.validation != null;

  return (
    <>
      {formattedOutput ? (
        <EuiPanel paddingSize='none'>
          <EuiCodeBlock
            language='json'
            paddingSize='m'
            isCopyable
            overflowHeight={400}
          >
            {formattedOutput}
          </EuiCodeBlock>
        </EuiPanel>
      ) : (
        <EuiCallOut title='No output' color='warning' iconType='alert'>
          <p>The logtest did not return any output.</p>
        </EuiCallOut>
      )}

      {hasAssetTraces && (
        <>
          <EuiSpacer size='l' />
          <EuiAccordion
            id='asset-traces-section'
            initialIsOpen={false}
            buttonContent={
              <EuiText size='s'>
                <h4>Asset Traces</h4>
              </EuiText>
            }
            paddingSize='s'
          >
            <EuiSpacer size='s' />
            <EuiPanel paddingSize='m'>
              {data.asset_traces!.map((trace, index) => (
                <React.Fragment key={`${trace.asset}-${index}`}>
                  {index > 0 && <EuiSpacer size='s' />}
                  <AssetTraceItem trace={trace} index={index} />
                </React.Fragment>
              ))}
            </EuiPanel>
          </EuiAccordion>
        </>
      )}

      {hasValidation && !data.validation!.valid && (
        <>
          <EuiSpacer size='l' />
          <EuiAccordion
            id='validation-section'
            initialIsOpen
            buttonContent={
              <EuiFlexGroup alignItems='center' gutterSize='s'>
                <EuiFlexItem>
                  <EuiText size='s'>
                    <h4>Validation</h4>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiBadge color='danger'>Failed</EuiBadge>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            paddingSize='s'
          >
            {data.validation!.errors.length > 0 && (
              <>
                <EuiSpacer size='s' />
                <EuiPanel paddingSize='m'>
                  {data.validation!.errors.map((error, index) => (
                    <React.Fragment
                      key={`${error.path}-${error.kind}-${index}`}
                    >
                      {index > 0 && <EuiSpacer size='s' />}
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

const DetectionSection: React.FC<{ data: LogTestDetectionResult }> = ({
  data,
}) => {
  if (data.status === 'skipped') {
    return (
      <EuiCallOut title='Detection skipped' color='warning' iconType='alert'>
        <p>{data.reason || 'Detection was skipped.'}</p>
      </EuiCallOut>
    );
  }

  if (data.status === 'error') {
    return (
      <EuiCallOut title='Detection error' color='danger' iconType='alert'>
        <p>{data.reason || 'Detection failed due to an unexpected error.'}</p>
      </EuiCallOut>
    );
  }

  const matches = data.matches ?? [];

  if (matches.length === 0) {
    return (
      <EuiCallOut title='No rules matched' color='primary' iconType='iInCircle'>
        <p>
          {data.rules_evaluated != null
            ? `${data.rules_evaluated} rules evaluated, 0 matched.`
            : 'No detection rules matched the log event.'}
        </p>
      </EuiCallOut>
    );
  }

  return (
    <>
      <EuiText size='s'>
        <p>
          <strong>{data.rules_evaluated}</strong> rules evaluated,{' '}
          <strong>{data.rules_matched}</strong> matched
        </p>
      </EuiText>
      <EuiSpacer size='m' />
      <EuiPanel paddingSize='m'>
        {matches.map((match, index) => (
          <React.Fragment key={`${match.rule.id}-${index}`}>
            {index > 0 && <EuiSpacer size='s' />}
            <DetectionMatchItem match={match} index={index} />
          </React.Fragment>
        ))}
      </EuiPanel>
    </>
  );
};

type ResultTab = 'normalization' | 'detection';

export const LogTestResult: React.FC<LogTestResultProps> = ({ result }) => {
  const [selectedTab, setSelectedTab] = useState<ResultTab>('normalization');
  const normalization = result?.message?.normalization;
  const detection = result?.message?.detection;

  return (
    <>
      <EuiFlexGroup justifyContent='spaceBetween' alignItems='center'>
        <EuiFlexItem grow={false}>
          <EuiText size='s'>
            <h3>Test Result</h3>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiBadge
            color={
              result?.status === 'OK' || String(result?.status) === '200'
                ? 'success'
                : 'warning'
            }
          >
            {result?.status}
          </EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size='m' />

      <EuiTabs size='s'>
        <EuiTab
          isSelected={selectedTab === 'normalization'}
          onClick={() => setSelectedTab('normalization')}
        >
          Normalization
        </EuiTab>
        <EuiTab
          isSelected={selectedTab === 'detection'}
          onClick={() => setSelectedTab('detection')}
        >
          Detection
        </EuiTab>
      </EuiTabs>

      <EuiSpacer size='m' />

      {selectedTab === 'normalization' &&
        (normalization ? (
          <NormalizationSection data={normalization} />
        ) : (
          <EuiCallOut
            title='No normalization data'
            color='primary'
            iconType='iInCircle'
          >
            <p>The logtest did not return normalization results.</p>
          </EuiCallOut>
        ))}

      {selectedTab === 'detection' &&
        (detection ? (
          <DetectionSection data={detection} />
        ) : (
          <EuiCallOut
            title='No detection data'
            color='primary'
            iconType='iInCircle'
          >
            <p>The logtest did not return detection results.</p>
          </EuiCallOut>
        ))}
    </>
  );
};
