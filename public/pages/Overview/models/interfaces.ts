/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';

export interface OverviewProps extends RouteComponentProps {}

export interface OverviewState {
  groupBy: string;
}

export interface FindingItem {
  id: number;
  time: string;
  findingName: string;
  detector: string;
}

export interface AlertItem {
  id: string;
  time: string;
  triggerName: string;
  severity: string;
}

export interface DetectorItem {
  id: string;
  detectorName: string;
  status: string;
  logTypes: string[];
}
