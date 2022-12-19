/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderVisualization } from '../../../../utils/helpers';
import React, { useEffect } from 'react';
import { FindingItem } from '../../models/interfaces';
import { WidgetContainer } from './WidgetContainer';
import { getTopRulesVisualizationSpec } from '../../utils/helpers';
import { ChartContainer } from '../../../../components/Charts/ChartContainer';

export interface TopRulesWidgetProps {
  findings: FindingItem[];
  loading?: boolean;
}

type RulesCount = { [ruleName: string]: number };

export const TopRulesWidget: React.FC<TopRulesWidgetProps> = ({ findings, loading = false }) => {
  useEffect(() => {
    const rulesCount: RulesCount = {};
    findings.forEach((finding) => {
      rulesCount[finding.ruleName] = (rulesCount[finding.ruleName] || 0) + 1;
    });

    if (Object.keys(rulesCount).length > 0) {
      const visualizationData = Object.keys(rulesCount).map((ruleName) => ({
        ruleName,
        count: 1,
      }));
      renderVisualization(getTopRulesVisualizationSpec(visualizationData), 'top-rules-view');
    }
  }, [findings]);

  return (
    <WidgetContainer title="Most frequent detection rules">
      <ChartContainer chartViewId={'top-rules-view'} loading={loading} />
    </WidgetContainer>
  );
};
