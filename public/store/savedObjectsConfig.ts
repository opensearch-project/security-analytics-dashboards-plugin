/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardCreationConfig } from '../../types';
import {
  vpcFlowLogsDashboardConfig,
  vpcFlowLogsIndexPatternConfig,
  vpcFlowLogsVisualizationConfigs,
} from './config/savedObjects/vpc-flow-logs';

const savedObjectsConfigsByLogType: { [logType: string]: DashboardCreationConfig } = {
  network: {
    'index-pattern': vpcFlowLogsIndexPatternConfig,
    visualizations: vpcFlowLogsVisualizationConfigs,
    dashboard: vpcFlowLogsDashboardConfig,
  },
};

export function getSavedObjectConfigs(logType: string): DashboardCreationConfig | undefined {
  return savedObjectsConfigsByLogType[logType];
}
