/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateDetectorResponse,
  DeleteDetectorResponse,
  Detector,
  SearchDetectorsResponse,
  UpdateDetectorResponse,
} from '../Detector';
import { ServerResponse } from './ServerResponse';

export type MatchAllQuery = { match_all: {} };

export interface IDetectorService {
  createDetector(detector: Detector): Promise<ServerResponse<CreateDetectorResponse>>;
  deleteDetector(detectorId: string): Promise<ServerResponse<DeleteDetectorResponse>>;
  getDetectors(): Promise<ServerResponse<SearchDetectorsResponse>>;
  updateDetector(
    detectorId: string,
    detector: Detector
  ): Promise<ServerResponse<UpdateDetectorResponse>>;
}
