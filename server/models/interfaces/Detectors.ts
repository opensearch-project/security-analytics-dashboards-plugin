/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Query } from '@elastic/eui';
import { Detector } from '../../../models/interfaces';

export interface CreateDetectorParams {
  body: Detector;
}

export interface CreateDetectorResponse {
  _id: string;
  _version: number;
  detector: DetectorResponse;
}

export interface GetDetectorParams {
  detectorId: string;
}

export interface GetDetectorResponse {}

export interface SearchDetectorsParams {
  body: { query: Query };
}

export interface SearchDetectorsResponse {
  hits: {
    total: { value: number };
    hits: DetectorHit[];
  };
}

export interface UpdateDetectorParams {
  body: Detector;
}

export interface UpdateDetectorResponse {
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

export interface DeleteDetectorParams {
  detectorId: string;
}

export interface DeleteDetectorResponse {}

export interface DetectorHit {
  _index: string;
  _source: DetectorResponse;
  _id: string;
}

export type DetectorResponse = Detector & {
  last_update_time: number;
  enabled_time: number;
};
