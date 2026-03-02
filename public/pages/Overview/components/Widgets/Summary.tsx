/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLinkColor,
  EuiStat,
  EuiText,
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { summaryGroupByOptions } from '../../utils/constants';
import { createSelectComponent } from '../../../../utils/helpers';
import { ROUTES } from '../../../../utils/constants';
import { OverviewFindingItem } from '../../../../../types';
// Wazuh: hide alerts in summary widget.
// import { OverviewAlertItem } from '../../../../../types';
import { getUseUpdatedUx } from '../../../../services/utils/constants';
// import { createBarAndLineChartWrapper } from '../../../../utils/chartUtils';

export interface SummaryProps {
  findings: OverviewFindingItem[];
  // Wazuh: hide alerts in summary widget.
  // alerts: OverviewAlertItem[];
}

export const SUMMARY_VIEW_CHART = 'summary-view';

export const Summary: React.FC<SummaryProps> = ({ findings }) => {
  const [groupBy, setGroupBy] = useState('');
  // Wazuh: hide alerts in summary widget.
  // const [alertsVisData, setAlertsVisData] = useState<any[]>([]);
  // Wazuh: hide alerts in summary widget.
  // const [activeAlerts, setActiveAlerts] = useState<undefined | number>(undefined);
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

  useEffect(() => {
    // Wazuh: hide alerts in summary widget.
    // const alertsVisData: any[] = [];
    // let activeAlerts = 0;
    // alerts.forEach((alert) => {
    //   if (!alert.acknowledged) {
    //     activeAlerts++;
    //   }
    //
    //   alertsVisData.push({
    //     time: alert.time,
    //     alert: 1,
    //     finding: 0,
    //     logType: alert.logType,
    //   });
    // });

    // Wazuh: hide alerts in summary widget.
    // const findingsVisData: any[] = [];
    // findings.forEach((finding) => {
    //   findingsVisData.push({
    //     time: finding.time,
    //     alert: 0,
    //     finding: 1,
    //     logType: finding.logType,
    //   });
    // });

    // setActiveAlerts(activeAlerts);
    setTotalFindings(findings.length);
    // Wazuh: hide alerts in summary widget.
    // setAlertsVisData(alertsVisData);
    // setFindingsVisData(findingsVisData);
  }, [alerts, findings]);

  // useEffect(() => {
  //   createBarAndLineChartWrapper(alertsVisData, findingsVisData, groupBy, SUMMARY_VIEW_CHART, {
  //     startTime,
  //     endTime,
  //   });
  // }, [alertsVisData, findingsVisData, groupBy]);

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
    <WidgetContainer title="Findings count" actions={createVisualizationActions(groupBy)}>
      {/* Wazuh: hide alerts in summary title. */}
      {/* <WidgetContainer title="Findings and alert count" actions={createVisualizationActions(groupBy)}> */}
      <EuiFlexGroup gutterSize="s" direction="column">
        {!getUseUpdatedUx() && (
          <EuiFlexItem>
            {totalFindings === 0 ? null : (
              <EuiFlexGroup gutterSize="xl">
                {/* Wazuh: hide alerts in summary widget. */}
                {/* {createStatComponent(
                  'Total active alerts',
                  { url: ROUTES.ALERTS, color: 'danger' },
                  activeAlerts
                )} */}
                {createStatComponent(
                  'Total findings',
                  { url: ROUTES.FINDINGS, color: 'primary' },
                  totalFindings
                )}
              </EuiFlexGroup>
            )}
          </EuiFlexItem>
        )}
        <EuiFlexItem>
          {totalFindings === 0 ? (
            <EuiEmptyPrompt
              title={
                <EuiText size="s">
                  <h2>No findings found</h2>
                  {/* Wazuh: hide alerts in empty prompt copy. */}
                  {/* <h2>No alerts and findings found</h2> */}
                </EuiText>
              }
              body={
                <>
                  <p>
                    <EuiText size="s">
                      Adjust the time range to see more results or create a <br />
                      detector to generate findings.
                    </EuiText>
                  </p>
                  <EuiSmallButton
                    href={`#${ROUTES.DETECTORS_CREATE}`}
                    fill={true}
                    data-test-subj={'detectorsCreateButton'}
                    iconType="plus"
                    iconSide="left"
                    iconGap="s"
                  >
                    Create a detector
                  </EuiSmallButton>
                </>
              }
            />
          ) : (
            <div id="chart-container">
              <canvas id={SUMMARY_VIEW_CHART}></canvas>
            </div>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </WidgetContainer>
  );
};
