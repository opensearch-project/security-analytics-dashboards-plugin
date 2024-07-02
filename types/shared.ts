/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CorrelationFinding } from './Correlations';
import { DetectorHit } from './Detector';
import { Finding, FindingDetailsFlyoutProps } from './Finding';
import { ThreatIntelFindingDetailsFlyoutProps } from './ThreatIntel';
import { RouteComponentProps } from 'react-router-dom';

export interface Duration {
  startTime: number;
  endTime: number;
}

export type FindingItemType = Finding & {
  logType: string;
  detectorName: string;
  detector: DetectorHit;
  correlations: CorrelationFinding[];
};

export interface FindingDetectorMetadata {
  detectorName: string;
  logType: string;
  detector: DetectorHit;
  correlations: [];
}

export type FlyoutPropsType = FindingDetailsFlyoutProps | ThreatIntelFindingDetailsFlyoutProps;

export type ShowFlyoutDataType<T extends FlyoutPropsType> = {
  component: any;
  componentProps: T;
};

export interface FlyoutBaseProps {
  history: RouteComponentProps['history'];
}
