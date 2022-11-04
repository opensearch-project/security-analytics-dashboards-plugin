/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';
import { OverviewViewModel } from './OverviewViewModel';

export interface OverviewProps extends RouteComponentProps {
  getStartedDismissedOnce: boolean;
  onGetStartedDismissed: () => void;
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
