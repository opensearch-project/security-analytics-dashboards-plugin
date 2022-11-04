/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderVisualization } from '../../../../utils/helpers';
import React, { useEffect } from 'react';
import { FindingItem } from '../../models/interfaces';
import { WidgetContainer } from './WidgetContainer';
import { getTopRulesVisualizationSpec } from '../../utils/helpers';

export interface TopRulesWidgetProps {
  findings: FindingItem[];
}

type RulesCount = { [ruleName: string]: number };

export const TopRulesWidget: React.FC<TopRulesWidgetProps> = ({ findings }) => {
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
      <div id="top-rules-view"></div>
    </WidgetContainer>
  );
};
