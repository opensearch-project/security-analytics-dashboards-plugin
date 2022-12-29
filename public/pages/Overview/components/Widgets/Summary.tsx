/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiLink, EuiStat } from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { summaryGroupByOptions } from '../../utils/constants';
import {
  getChartTimeUnit,
  getDomainRange,
  getOverviewVisualizationSpec,
  getTimeWithMinPrecision,
  TimeUnit,
} from '../../utils/helpers';
import { AlertItem, FindingItem } from '../../models/interfaces';
import { createSelectComponent, renderVisualization } from '../../../../utils/helpers';
import { ROUTES } from '../../../../utils/constants';
import { ChartContainer } from '../../../../components/Charts/ChartContainer';

export interface SummaryProps {
  findings: FindingItem[];
  alerts: AlertItem[];
  loading?: boolean;
  startTime: string;
  endTime: string;
  timeUnit: TimeUnit;
}

export interface SummaryData {
  time: number;
  alert: number;
  finding: number;
  logType?: string;
}

export const Summary: React.FC<SummaryProps> = ({
  alerts,
  findings,
  startTime,
  endTime,
  timeUnit,
  loading = false,
}) => {
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

  const generateVisualizationSpec = useCallback(
    (summaryData, groupBy) => {
      const chartTimeUnits = getChartTimeUnit(startTime, endTime);
      return getOverviewVisualizationSpec(summaryData, groupBy, {
        timeUnit: chartTimeUnits.timeUnit,
        dateFormat: chartTimeUnits.dateFormat,
        domain: getDomainRange([startTime, endTime], chartTimeUnits.timeUnit.unit),
      });
    },
    [startTime, endTime]
  );

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
        logType: alert.logType,
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
              <EuiStat
                title={<EuiLink href={`#${ROUTES.ALERTS}`}>{activeAlerts}</EuiLink>}
                description="Total active alerts"
                textAlign="left"
                titleColor="primary"
                isLoading={!activeAlerts}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiStat
                title={<EuiLink href={`#${ROUTES.FINDINGS}`}>{totalFindings}</EuiLink>}
                description="Total findings"
                textAlign="left"
                titleColor="primary"
                isLoading={!totalFindings}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <ChartContainer chartViewId={'summary-view'} loading={loading} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </WidgetContainer>
  );
};
