/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn } from '@elastic/eui';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { DetectorHit } from './Detector';
import { SortDirection } from '../public/utils/constants';
import { DataSourceProps } from './DataSource';
import { ThreatIntelFinding } from './ThreatIntel';

export interface DateTimeFilter {
  startTime: string;
  endTime: string;
}

export interface OverviewViewModel {
  detectors: DetectorHit[];
  findings: OverviewFindingItem[];
  // Wazuh: hide alerts and correlations from overview view model.
  // alerts: OverviewAlertItem[];
  threatIntelFindings: ThreatIntelFinding[];
  // Wazuh: hide alerts and correlations from overview view model.
  // correlations: number;
}

export type OverviewViewModelRefreshHandler = (
  overviewState: OverviewViewModel,
  modelUpdateComplete: boolean
) => void;

export interface OverviewProps extends RouteComponentProps, DataSourceProps {
  getStartedDismissedOnce: boolean;
  onGetStartedDismissed: () => void;
  notifications?: NotificationsStart;
  setDateTimeFilter?: Function;
  dateTimeFilter?: DateTimeFilter;
}

export interface OverviewState {
  groupBy: string;
  overviewViewModel: OverviewViewModel;
}

export interface OverviewFindingItem {
  id: string;
  time: number;
  findingName: string;
  detector: string;
  logType: string;
  ruleId: string;
  ruleName: string;
  ruleSeverity: string;
  isThreatIntelOnlyFinding: boolean;
}

export interface OverviewAlertItem {
  id: string;
  time: string;
  triggerName: string;
  severity: string;
  logType: string;
  acknowledged: boolean;
}

export interface OverviewDetectorItem {
  id: string;
  detectorName: string;
  status: string;
  logTypes: string;
}

export type TableWidgetItem =
  | OverviewFindingItem
  // Wazuh: hide alerts in overview table widget union.
  // | OverviewAlertItem
  | OverviewDetectorItem
  | ThreatIntelFinding;

export type TableWidgetProps<T extends TableWidgetItem> = {
  columns: EuiBasicTableColumn<T>[];
  items: T[];
  sorting?: {
    sort: {
      field: string;
      direction: SortDirection;
    };
  };
  className?: string;
  loading?: boolean;
  message?: React.ReactNode;
};

export interface DetectorItem {
  id: string;
  detectorName: string;
  status: string;
  logTypes: string;
}
