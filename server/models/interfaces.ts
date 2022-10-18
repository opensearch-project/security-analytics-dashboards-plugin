/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector } from '../../models/interfaces';
import DetectorsService from '../services/DetectorService';
import IndexService from '../services/IndexService';

export interface SecurityAnalyticsApi {
  readonly DETECTORS_BASE: string;
  readonly INDICES_BASE: string;
}

export interface NodeServices {
  detectorsService: DetectorsService;
  indexService: IndexService;
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

export interface GetIndicesResponse {
  indices: CatIndex[];
}

// Default _cat index response
export interface CatIndex {
  'docs.count': string;
  'docs.deleted': string;
  health: string;
  index: string;
  pri: string;
  'pri.store.size': string;
  rep: string;
  status: string;
  'store.size': string;
  uuid: string;
  data_stream: string | null;
}
