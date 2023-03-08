/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLinkColor,
  EuiStat,
} from '@elastic/eui';
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
  loading = false,
}) => {
  const [groupBy, setGroupBy] = useState('');
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<undefined | number>(undefined);
  const [totalFindings, setTotalFindings] = useState<undefined | number>(undefined);

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

  const createStatComponent = useCallback(
    (description: string, urlData: { url: string; color: EuiLinkColor }, stat?: number) => (
      <EuiFlexItem grow={false}>
        <EuiStat
          title={
            stat === 0 ? (
              0
            ) : (
              <EuiLink href={`#${urlData.url}`} color={urlData.color}>
                {stat}
              </EuiLink>
            )
          }
          description={description}
          textAlign="left"
          titleSize="l"
          titleColor="subdued"
          isLoading={stat === undefined}
        />
      </EuiFlexItem>
    ),
    []
  );

  return (
    <WidgetContainer title="Findings and alert count" actions={createVisualizationActions(groupBy)}>
      <EuiFlexGroup gutterSize="s" direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="xl">
            {createStatComponent(
              'Total active alerts',
              { url: ROUTES.ALERTS, color: 'danger' },
              activeAlerts
            )}
            {createStatComponent(
              'Total findings',
              { url: ROUTES.FINDINGS, color: 'primary' },
              totalFindings
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          {activeAlerts === 0 && totalFindings === 0 ? (
            <EuiEmptyPrompt
              title={<h2>No alerts and findings found</h2>}
              body={
                <p>
                  Adjust the time range to see more results or{' '}
                  <EuiLink href={`#${ROUTES.DETECTORS_CREATE}`}>create a detector</EuiLink> to
                  generate findings.{' '}
                </p>
              }
            />
          ) : (
            <ChartContainer chartViewId={'summary-view'} loading={loading} />
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </WidgetContainer>
  );
};
