/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
              onClick={() => DataStore.findings.openFlyout(finding, findings, false)}
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

  const list = [
    {
      title: 'Generated',
      description: timestamp,
    },
    {
      title: 'Detection rule',
      description: detectionRule.name,
    },
  ];

  return (
    <EuiPanel>
      {correlationHeader}
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <div>
            <EuiBadge
              color={getSeverityColor(detectionRule.severity).background}
              style={{ padding: '3px 10px' }}
            >
              {getSeverityLabel(detectionRule.severity)}
            </EuiBadge>
            <EuiBadge color="hollow" style={{ padding: '3px 10px' }}>
              {getLabelFromLogType(logType)}
            </EuiBadge>
          </div>
        </EuiFlexItem>
        {!correlationData && (
          <EuiFlexItem grow={false}>
            <EuiToolTip content={'View finding details'}>
              <EuiButtonIcon
                aria-label={'View finding details'}
                data-test-subj={`view-details-icon`}
                iconType={'expand'}
                onClick={() => DataStore.findings.openFlyout(finding, findings, false)}
              />
            </EuiToolTip>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {correlationHeader ? <EuiHorizontalRule margin="s" /> : null}
      <EuiSpacer size="m" />
      <EuiDescriptionList type="column" textStyle="reverse" listItems={list} />
    </EuiPanel>
  );
};
