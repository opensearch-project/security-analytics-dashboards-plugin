/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn } from '@elastic/eui';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { DetectorHit } from './Detector';

export interface DateTimeFilter {
  startTime: string;
  endTime: string;
}

export interface OverviewViewModel {
  detectors: DetectorHit[];
  findings: OverviewFindingItem[];
  alerts: OverviewAlertItem[];
}

export type OverviewViewModelRefreshHandler = (overviewState: OverviewViewModel) => void;

export interface OverviewProps extends RouteComponentProps {
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

export type TableWidgetItem = OverviewFindingItem | OverviewAlertItem | OverviewDetectorItem;

export type TableWidgetProps<T extends TableWidgetItem> = {
  columns: EuiBasicTableColumn<T>[];
  items: T[];
  loading?: boolean;
};
