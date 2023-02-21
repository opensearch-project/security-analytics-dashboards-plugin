/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardCreationConfig } from '../../types';
import {
  cloudtrailDashboardConfig,
  cloudtrailIndexPatternConfig,
  cloudtrailVisualizationConfigs,
} from './config/savedObjects/cloudtrail';
import {
  s3DashboardConfig,
  s3IndexPatternConfig,
  s3VisualizationConfigs,
} from './config/savedObjects/s3';
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
  cloudtrail: {
    'index-pattern': cloudtrailIndexPatternConfig,
    visualizations: cloudtrailVisualizationConfigs,
    dashboard: cloudtrailDashboardConfig,
  },
  s3: {
    'index-pattern': s3IndexPatternConfig,
    visualizations: s3VisualizationConfigs,
    dashboard: s3DashboardConfig,
  },
};

export function getSavedObjectConfigs(logType: string): DashboardCreationConfig | undefined {
  return savedObjectsConfigsByLogType[logType];
}
