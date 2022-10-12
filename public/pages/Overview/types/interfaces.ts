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
