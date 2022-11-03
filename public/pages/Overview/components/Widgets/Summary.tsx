/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiText, EuiLink } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import React, { useCallback, useEffect, useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { summaryGroupByOptions } from '../../utils/constants';
import { getOverviewVisualizationSpec, getTimeWithMinPrecision } from '../../utils/helpers';
import { AlertItem, FindingItem } from '../../models/interfaces';
import { createSelectComponent, renderVisualization } from '../../../../utils/helpers';

export interface SummaryProps {
  findings: FindingItem[];
  alerts: AlertItem[];
}

export interface SummaryData {
  time: number;
  alert: number;
  finding: number;
  logType?: string;
}

export const Summary: React.FC<SummaryProps> = ({ alerts, findings }) => {
  const [groupBy, setGroupBy] = useState('');
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [totalFindings, setTotalFindings] = useState(0);

  const onGroupByChange = useCallback((event) => {
    setGroupBy(event.target.value);
  }, []);

  const createVisualizationActions = useCallback(
    (groupBy): React.ReactNode[] => {
      return [
        createSelectComponent(
          summaryGroupByOptions,
          groupBy,
          'overview-vis-options',
          onGroupByChange
        ),
      ];
    },
    [onGroupByChange]
  );

  const generateVisualizationSpec = useCallback((summaryData, groupBy) => {
    return getOverviewVisualizationSpec(summaryData, groupBy);
  }, []);

  useEffect(() => {
    const summaryData: SummaryData[] = [];
    let activeAlerts = 0;
    alerts.forEach((alert) => {
      if (!alert.acknowledged) {
        activeAlerts++;
      }

      summaryData.push({
        time: getTimeWithMinPrecision(alert.time),
        alert: 1,
        finding: 0,
      });
    });

    findings.forEach((finding) => {
      summaryData.push({
        time: getTimeWithMinPrecision(finding.time),
        alert: 0,
        finding: 1,
        logType: finding.logType,
      });
    });

    setActiveAlerts(activeAlerts);
    setTotalFindings(findings.length);
    setSummaryData(summaryData);
  }, [alerts, findings]);

  useEffect(() => {
    renderVisualization(generateVisualizationSpec(summaryData, groupBy), 'summary-view');
  }, [summaryData, groupBy]);

  return (
    <WidgetContainer title="Findings and alert count" actions={createVisualizationActions(groupBy)}>
      <EuiFlexGroup gutterSize="s" direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="xl">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <p>Total active alerts</p>
              </EuiText>
              <EuiLink href={`#${ROUTES.ALERTS}`} className="page-link">
                {activeAlerts}
              </EuiLink>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <p>Total findings</p>
              </EuiText>
              <EuiLink href={`#${ROUTES.FINDINGS}`} className="page-link">
                {totalFindings}
              </EuiLink>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <div id="summary-view" style={{ width: '100%' }}></div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </WidgetContainer>
  );
};
