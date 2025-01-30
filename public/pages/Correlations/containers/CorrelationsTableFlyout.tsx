/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiTextColor,
  EuiPanel,
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiBadge,
  EuiLink,
} from '@elastic/eui';
import { displayBadges } from '../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { capitalizeFirstLetter } from '../../../utils/helpers';
import { CorrelationGraph } from '../components/CorrelationGraph';
import { getSeverityColor, graphRenderOptions } from '../utils/constants';
import { CorrelationFinding, CorrelationGraphData } from '../../../../types';
import { CorrelationsTableData } from './CorrelationsContainer';

interface FlyoutTableData {
  timestamp: string;
  mitreTactic: string[];
  detectionRule: string;
  severity: string;
}

interface CorrelationsTableFlyoutProps {
  isFlyoutOpen: boolean;
  selectedTableRow: CorrelationsTableData | null;
  flyoutGraphData: CorrelationGraphData;
  loadingGraphData: boolean;
  onClose: () => void;
  setNetwork: (network: any) => void;
}

export const CorrelationsTableFlyout: React.FC<CorrelationsTableFlyoutProps> = ({
  isFlyoutOpen,
  selectedTableRow,
  flyoutGraphData,
  loadingGraphData,
  onClose,
  setNetwork,
}) => {
  if (!isFlyoutOpen || !selectedTableRow) {
    return null;
  }

  const findingsTableColumns: EuiBasicTableColumn<FlyoutTableData>[] = [
    {
      field: 'timestamp',
      name: 'Time',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sortable: true,
    },
    {
      field: 'mitreTactic',
      name: 'Mitre Tactic',
      sortable: true,
      render: (mitreTactic: string[]) => displayBadges(mitreTactic),
    },
    {
      field: 'detectionRule',
      name: 'Detection Rule',
      sortable: true,
    },
    {
      field: 'severity',
      name: 'Severity',
      render: (ruleSeverity: string) => {
        const severity = capitalizeFirstLetter(ruleSeverity) || DEFAULT_EMPTY_DATA;
        const { background, text } = getSeverityColor(severity);

        return (
          <EuiBadge color={background} style={{ color: text }}>
            {severity}
          </EuiBadge>
        );
      },
    },
  ];

  const flyoutTableData: FlyoutTableData[] = selectedTableRow.correlatedFindings.map(
    (correlatedFinding: CorrelationFinding) => ({
      timestamp: correlatedFinding.timestamp,
      mitreTactic:
        correlatedFinding.detectionRule.tags?.map((mitreTactic) => mitreTactic.value) || [],
      detectionRule: correlatedFinding.detectionRule.name,
      severity: correlatedFinding.detectionRule.severity,
    })
  );

  return (
    <EuiFlyout ownFocus onClose={onClose} size="l" aria-labelledby="flyoutTitle">
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">Correlation Details</h2>
        </EuiTitle>
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>
              <p>
                <EuiTextColor color="subdued">Time</EuiTextColor>
                <br />
                {new Date(selectedTableRow.startTime).toLocaleString()}
              </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              <p>
                <EuiTextColor color="subdued">Alert</EuiTextColor>
                <br />
                {selectedTableRow.correlationRuleObj?.trigger?.name}
              </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              <p>
                <EuiTextColor color="subdued">Correlation Rule</EuiTextColor>
                <br />
                {selectedTableRow.correlationRule}
              </p>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiPanel style={{ height: '100%', overflow: 'auto', border: 'none' }}>
          <EuiPanel>
            <EuiTitle>
              <h3>Correlated Findings</h3>
            </EuiTitle>
            {selectedTableRow.correlatedFindings && (
              <CorrelationGraph
                loadingData={loadingGraphData}
                graph={flyoutGraphData.graph}
                options={{
                  ...graphRenderOptions,
                  height: '300px',
                  width: '100%',
                  autoResize: true,
                }}
                events={flyoutGraphData.events}
                getNetwork={setNetwork}
              />
            )}
          </EuiPanel>
          <EuiSpacer />
          <EuiTitle size="xs">
            <h3>Findings</h3>
          </EuiTitle>
          <EuiInMemoryTable
            items={flyoutTableData || []}
            columns={findingsTableColumns}
            pagination={{
              initialPageSize: 5,
              pageSizeOptions: [5, 10, 20],
            }}
            sorting={true}
          />
          <EuiSpacer size="l" />
          <EuiPanel>
            <EuiTitle>
              <h3>Observed MITRE Attack Tactics</h3>
            </EuiTitle>
            <EuiSpacer size="m" />
            <EuiFlexGroup wrap responsive={false} gutterSize="m">
              {Array.from(
                new Set(
                  selectedTableRow.correlatedFindings.flatMap(
                    (finding: CorrelationFinding) =>
                      finding.detectionRule.tags?.map((tag) => tag.value) || []
                  )
                )
              ).map((tactic, i) => {
                const link = `https://attack.mitre.org/techniques/${tactic
                  .split('.')
                  .slice(1)
                  .join('/')
                  .toUpperCase()}`;

                return (
                  <EuiFlexItem grow={false} key={i}>
                    <EuiBadge color="#DDD">
                      <EuiLink href={link} target="_blank">
                        {tactic}
                      </EuiLink>
                    </EuiBadge>
                  </EuiFlexItem>
                );
              })}
            </EuiFlexGroup>
          </EuiPanel>
        </EuiPanel>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
