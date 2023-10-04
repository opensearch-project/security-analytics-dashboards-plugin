/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiSpacer,
  EuiBadge,
  EuiHorizontalRule,
  EuiToolTip,
  EuiDescriptionList,
} from '@elastic/eui';
import { getSeverityLabel, getSeverityColor, getLabelFromLogType } from '../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { CorrelationFinding } from '../../../../types';

export interface FindingCardProps {
  id: string;
  logType: string;
  timestamp: string;
  detectionRule: { name: string; severity: string };
  correlationData?: {
    score: string;
    onInspect: (findingId: string, logType: string) => void;
  };
  finding: CorrelationFinding;
  findings: CorrelationFinding[];
}

export const FindingCard: React.FC<FindingCardProps> = ({
  correlationData,
  id,
  logType,
  timestamp,
  detectionRule,
  finding,
  findings,
}) => {
  const list = [
    {
      title: 'Detection rule',
      description: detectionRule.name,
    },
  ];

  if (finding.correlationRule) {
    list.unshift({
      title: 'Correlation score',
      description: finding.correlationRule.name,
    });
  }

  const badgePadding = '2px 7px';
  const { text: severityText, background } = getSeverityColor(detectionRule.severity);

  const header = (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
      <EuiFlexItem grow={false}>
        <div>
          <EuiBadge color={background} style={{ padding: badgePadding, color: severityText }}>
            {getSeverityLabel(detectionRule.severity)}
          </EuiBadge>
          <EuiBadge color="hollow" style={{ padding: '3px 10px' }}>
            {getLabelFromLogType(logType)}
          </EuiBadge>
        </div>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <div>
          <EuiToolTip content={'View finding details'}>
            <EuiButtonIcon
              aria-label={'View finding details'}
              data-test-subj={`view-details-icon`}
              iconType={'inspect'}
              onClick={() => DataStore.findings.openFlyout(finding, findings, false)}
            />
          </EuiToolTip>
          <EuiButtonIcon
            iconType={correlationData ? 'pin' : 'pinFilled'}
            onClick={() => correlationData?.onInspect(id, logType)}
            disabled={!correlationData}
          />
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const attrList = <EuiDescriptionList type="column" textStyle="reverse" listItems={list} />;

  const relatedFindingCard = (
    <EuiPanel>
      {header}
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent="spaceBetween" gutterSize="xs" alignItems="center">
        <EuiFlexItem grow={false}>
          <p>Correlation score</p>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <b>{correlationData?.score}</b>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <span>{timestamp}</span>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiHorizontalRule margin="s" />
      {attrList}
    </EuiPanel>
  );

  return correlationData ? (
    relatedFindingCard
  ) : (
    <EuiPanel>
      {header}
      <EuiSpacer size="m" />
      {attrList}
    </EuiPanel>
  );
};
