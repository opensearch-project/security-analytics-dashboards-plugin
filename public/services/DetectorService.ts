/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  CreateDetectorResponse,
  DeleteDetectorResponse,
  SearchDetectorsResponse,
  UpdateDetectorResponse,
} from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { Detector } from '../../models/interfaces';
import { IDetectorService } from '../../types';

export default class DetectorsService implements IDetectorService {
  constructor(private httpClient: HttpSetup) {}

  createDetector = async (detector: Detector): Promise<ServerResponse<CreateDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(detector),
    })) as ServerResponse<CreateDetectorResponse>;

    return response;
  };

  getDetectors = async (): Promise<ServerResponse<SearchDetectorsResponse>> => {
    const url = `..${API.SEARCH_DETECTORS}`;
    const res = (await this.httpClient.post(url, {
      body: JSON.stringify({
        query: {
          match_all: {},
        },
      }),
    })) as ServerResponse<SearchDetectorsResponse>;

    return res;
  };

  updateDetector = async (
    detectorId: string,
    detector: Detector
  ): Promise<ServerResponse<UpdateDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}/${detectorId}`;
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(detector),
    })) as ServerResponse<UpdateDetectorResponse>;

    return response;
  };

  deleteDetector = async (detectorId: string): Promise<ServerResponse<DeleteDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}/${detectorId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<DeleteDetectorResponse>;

    return response;
  };
}
