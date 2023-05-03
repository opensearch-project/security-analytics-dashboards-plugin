/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonIcon,
  EuiSpacer,
  EuiBadge,
  EuiHorizontalRule,
  EuiToolTip,
} from '@elastic/eui';
import { rulePriorityBySeverity } from '../../CreateDetector/components/DefineDetector/components/DetectionRules/DetectionRulesTable';
import {
  getAbbrFromLogType,
  getSeverityLabel,
  getSeverityColor,
  getLabelFromLogType,
} from '../utils/constants';

export interface FindingCardProps {
  id: string;
  logType: string;
  timestamp: string;
  detectionRule: { name: string; severity: string };
  correlationData?: {
    // ruleName: string;
    score: number;
    onInspect: (findingId: string, logType: string) => void;
  };
}

export const FindingCard: React.FC<FindingCardProps> = ({
  correlationData,
  id,
  logType,
  timestamp,
  detectionRule,
}) => {
  const correlationHeader = correlationData ? (
    <>
      <EuiFlexGroup className={'finding-card-header'}>
        <EuiFlexItem grow={true}>
          <EuiText style={{ fontSize: 22, fontWeight: 300 }}>{correlationData.score}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip content={'View finding details'}>
            <EuiButtonIcon
              aria-label={'View finding details'}
              data-test-subj={`view-details-icon`}
              iconType={'expand'}
              onClick={() => {}}
            />
          </EuiToolTip>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType={'inspect'}
            onClick={() => correlationData.onInspect(id, logType)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiText size="s">Correlation score</EuiText>
      <EuiSpacer size="m" />
    </>
  ) : null;

  const createTextRow = useCallback((label: string, value: string) => {
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText size="s">{label}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText>{value}</EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }, []);

  return (
    <EuiPanel>
      {correlationHeader}
      <EuiFlexGroup justifyContent="flexStart" alignItems="center">
        <EuiFlexItem grow={2} style={{ maxWidth: 120 }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '35px',
                height: '35px',
                border: '1px solid',
                borderRadius: '50%',
                position: 'relative',
                fontSize: 10,
                lineHeight: '35px',
                textAlign: 'center',
              }}
            >
              {getAbbrFromLogType(logType)}
            </div>
            {getSeverityLabel(detectionRule.severity) ? (
              <EuiBadge
                style={{
                  position: 'absolute',
                  transform: 'translateY(-100%)',
                  left: '33px',
                }}
                color={getSeverityColor(detectionRule.severity)}
              >
                {rulePriorityBySeverity[detectionRule.severity]}{' '}
                {getSeverityLabel(detectionRule.severity)}
              </EuiBadge>
            ) : null}
          </div>
        </EuiFlexItem>
        <EuiFlexItem grow={1}>
          <strong>{getLabelFromLogType(logType)}</strong>
        </EuiFlexItem>
      </EuiFlexGroup>
      {correlationHeader ? <EuiHorizontalRule margin="s" /> : null}
      <EuiSpacer size="m" />
      {createTextRow('Generated', timestamp)}
      {createTextRow('Detection rule', detectionRule.name)}
    </EuiPanel>
  );
};
