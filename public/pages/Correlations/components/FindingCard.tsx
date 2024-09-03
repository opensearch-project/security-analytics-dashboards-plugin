/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiBadge,
  EuiHorizontalRule,
  EuiToolTip,
  EuiDescriptionList,
  EuiText,
  EuiIcon,
} from '@elastic/eui';
import { getSeverityLabel, getSeverityColor, getLabelFromLogType } from '../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { CorrelationFinding } from '../../../../types';

export interface FindingCardProps {
  id: string;
  logType: string;
  timestamp: string;
  detectionRule: CorrelationFinding['detectionRule'];
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
      title: <b>Detection rule</b>,
      description: <EuiText size="s">{detectionRule.name}</EuiText>,
    },
  ];

  if (finding.correlationRule) {
    list.unshift({
      title: <b>Correlation rule</b>,
      description: <EuiText size="s">{finding.correlationRule.name}</EuiText>,
    });
  }

  const badgePadding = '0px 6px';
  const { text: severityText, background } = getSeverityColor(detectionRule.severity);
  const logTypeAndSeverityItem = (
    <div>
      <EuiBadge
        color={background}
        style={{ padding: badgePadding, color: severityText, marginRight: 10 }}
      >
        {getSeverityLabel(detectionRule.severity)}
      </EuiBadge>
      <span style={{ fontSize: 12 }}>
        <b>{getLabelFromLogType(logType)}</b>
      </span>
    </div>
  );
  const openFindingFlyoutButton = (
    <EuiToolTip content={'View finding details'}>
      <EuiSmallButtonIcon
        aria-label={'View finding details'}
        data-test-subj={`view-details-icon`}
        iconType={'inspect'}
        onClick={() => DataStore.findings.openFlyout(finding, findings, false)}
      />
    </EuiToolTip>
  );

  const pinnedFindingHeader = (
    <>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText color="success">{id}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>{openFindingFlyoutButton}</EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>{logTypeAndSeverityItem}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued">
            {timestamp}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiHorizontalRule margin="s" />
    </>
  );

  const relatedFindingHeader = (
    <>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            Correlation score{' '}
            <EuiToolTip
              content={`The score (0-1) is based on the proximity of relevant findings in the threat scenario defined by the
            correlation rule. The greater the score, the stronger the correlation.`}
            >
              <EuiIcon type={'iInCircle'} color="primary" />
            </EuiToolTip>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <b>{correlationData?.score}</b>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <div>
            {openFindingFlyoutButton}
            <EuiSmallButtonIcon
              iconType={'pin'}
              onClick={() => correlationData?.onInspect(id, logType)}
            />
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent="spaceBetween" gutterSize="xs" alignItems="center">
        <EuiFlexItem grow={false}>{logTypeAndSeverityItem}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued">
            {timestamp}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiHorizontalRule margin="s" />
    </>
  );

  const attrList = (
    <EuiDescriptionList type="column" textStyle="reverse" listItems={list} compressed />
  );

  const relatedFindingCard = (
    <EuiPanel paddingSize="s">
      <EuiFlexGroup justifyContent="spaceBetween" gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiIcon type={'returnKey'} style={{ transform: 'scale(-1, 1)', marginTop: 3 }} />
        </EuiFlexItem>
        <EuiFlexItem>
          {relatedFindingHeader}
          {attrList}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );

  const pinnedFindingRuleTags = detectionRule.tags
    ? detectionRule.tags.map((tag) => <EuiBadge>{tag.value}</EuiBadge>)
    : null;

  const pinnedFindingCard = (
    <EuiPanel>
      {pinnedFindingHeader}
      {attrList}
      <EuiSpacer size="m" />
      {pinnedFindingRuleTags}
    </EuiPanel>
  );

  return correlationData ? relatedFindingCard : pinnedFindingCard;
};
