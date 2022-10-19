/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector } from '../../models/interfaces';
import DetectorsService from '../services/DetectorService';
import { FindingsService, IndexService, OpenSearchService } from '../services';

export interface SecurityAnalyticsApi {
  readonly DETECTORS_BASE: string;
  readonly INDICES_BASE: string;
  readonly GET_FINDINGS: string;
  readonly DOCUMENT_IDS_QUERY: string;
  readonly TIME_RANGE_QUERY: string;
}

export interface NodeServices {
  detectorsService: DetectorsService;
  indexService: IndexService;
  findingsService: FindingsService;
  opensearchService: OpenSearchService;
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

export interface GetFindingsParams {
  detectorType: string;
}

export interface GetFindingsResponse {
  detector_id: string;
  total_findings: number;
  findings: Finding[];
}

export interface SearchResponse<T> {
  hits: {
    total: { value: number };
    hits: { _source: T; _id: string; _seq_no?: number; _primary_term?: number }[];
  };
}

export interface DocumentIdsQueryParams {
  index: string;
  body: string;
}

export interface TimeRangeQueryParams {
  index: string;
  body: string;
}
