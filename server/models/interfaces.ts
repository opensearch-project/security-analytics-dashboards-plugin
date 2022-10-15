/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector } from '../../models/interfaces';
import DetectorsService from '../services/DetectorService';

export interface SecurityAnalyticsApi {
  readonly DETECTORS_BASE: string;
}

export interface NodeServices {
  detectorsService: DetectorsService;
}

export interface CreateDetectorParams {
  body: Detector;
}

export interface CreateDetectorResponse {
  _id: string;
  _version: number;
  detector: {
    detector: Detector & {
      last_update_time: number;
      monitor_id: string;
      rule_topic_index: string;
    };
  };
}
