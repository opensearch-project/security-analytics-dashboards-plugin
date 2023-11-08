/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { OverviewViewModel } from './OverviewViewModel';

export interface DateTimeFilter {
  startTime: string;
  endTime: string;
}

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

export interface FindingItem {
  id: string;
  time: number;
  findingName: string;
  detector: string;
  logType: string;
  ruleId: string;
  ruleName: string;
  ruleSeverity: string;
}

export interface AlertItem {
  id: string;
  time: string;
  triggerName: string;
  severity: string;
  logType: string;
  acknowledged: boolean;
}

export interface DetectorItem {
  id: string;
  detectorName: string;
  status: string;
  logTypes: string;
}
