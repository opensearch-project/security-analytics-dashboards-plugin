/*
* Copyright OpenSearch Contributors
* SPDX-License-Identifier: Apache-2.0
*/

import { CorrelationFinding } from "./Correlations";
import { DetectorHit } from "./Detector";
import { Finding } from "./Finding";

export interface AbortSignal {
  signal: boolean;
}

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
  detector: DetectorHit
  correlations: []
}