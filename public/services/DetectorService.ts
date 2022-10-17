/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { CreateDetectorResponse } from '../../server/models/interfaces';
import { API } from '../../server/utils/constants';
import { Detector } from '../../models/interfaces';

export default class DetectorsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  createDetector = async (detector: Detector): Promise<ServerResponse<CreateDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(detector),
    })) as ServerResponse<CreateDetectorResponse>;

    return response;
  };
}
