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
} from '@elastic/eui';

export interface FindingCardProps {
  id: string;
  logType: string;
  timestamp: string;
  detectionRule: { name: string; severity: string };
  correlationData?: {
    // ruleName: string;
    score: number;
    onInspect: (findingId: string) => void;
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
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiText size="m">{correlationData.score}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon iconType={'inspect'} onClick={() => correlationData.onInspect(id)} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiText>Correlation score</EuiText>
      <EuiSpacer size="m" />
    </>
  ) : null;

  const createTextRow = useCallback((label: string, value: string) => {
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText size="s">{label}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText>
            <strong>{value}</strong>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }, []);

  return (
    <EuiPanel>
      {correlationHeader}
      <EuiFlexGroup justifyContent="flexStart">
        <EuiFlexItem grow={false}>
          <EuiBadge>{detectionRule.severity}</EuiBadge>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>{logType}</EuiFlexItem>
      </EuiFlexGroup>
      {correlationHeader ? <EuiHorizontalRule margin="s" /> : null}
      <EuiSpacer size="m" />
      {createTextRow('Generated', timestamp)}
      {createTextRow('Detection rule', detectionRule.name)}
    </EuiPanel>
  );
};
