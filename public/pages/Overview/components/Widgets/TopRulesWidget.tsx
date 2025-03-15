/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getEuiEmptyPrompt } from '../../../../utils/helpers';
import React, { useEffect } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { OverviewFindingItem } from '../../../../../types';
import { createDoughnutChartWrapper } from '../../../../utils/chartUtils';

export interface TopRulesWidgetProps {
  findings: OverviewFindingItem[];
  loading?: boolean;
}

type RulesCount = { [ruleName: string]: number };

export const TOP_RULES_VIEW_CHART = 'top-rules-view';

export const TopRulesWidget: React.FC<TopRulesWidgetProps> = ({ findings, loading = false }) => {
  useEffect(() => {
    const rulesCount: RulesCount = {};
    findings.forEach((finding) => {
      rulesCount[finding.ruleName] = (rulesCount[finding.ruleName] || 0) + 1;
    });

    if (Object.keys(rulesCount).length > 0) {
      const visualizationData = Object.keys(rulesCount).map((ruleName) => ({
        ruleName,
        count: rulesCount[ruleName],
      }));
      createDoughnutChartWrapper(visualizationData, TOP_RULES_VIEW_CHART);
    }
  }, [findings]);

  return (
    <WidgetContainer title="Most frequent detection rules">
      {findings.length === 0 ? (
        getEuiEmptyPrompt('No findings with detection rules.')
      ) : (
        <div id="chart-container">
          <canvas id={TOP_RULES_VIEW_CHART}></canvas>
        </div>
      )}
    </WidgetContainer>
  );
};
