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
import { Detector, GetDetectorResponse, IDetectorService } from '../../types';
import { dataSourceInfo } from './utils/constants';

export default class DetectorsService implements IDetectorService {
  constructor(private httpClient: HttpSetup) {}

  createDetector = async (detector: Detector): Promise<ServerResponse<CreateDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(detector),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<CreateDetectorResponse>;

    return response;
  };

  getDetectors = async (dataSource?: any): Promise<ServerResponse<SearchDetectorsResponse>> => {
    const url = `..${API.SEARCH_DETECTORS}`;
    const dataSourceId = dataSource?.id || dataSourceInfo.activeDataSource.id;

    const res = (await this.httpClient.post(url, {
      body: JSON.stringify({
        query: {
          match_all: {},
        },
      }),
      query: {
        dataSourceId: dataSourceId,
      },
    })) as ServerResponse<SearchDetectorsResponse>;

    return res;
  };

  getDetectorWithId = async (id: string): Promise<ServerResponse<GetDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}/${id}`;
    const res = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetDetectorResponse>;

    return res;
  };

  updateDetector = async (
    detectorId: string,
    detector: Detector
  ): Promise<ServerResponse<UpdateDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}/${detectorId}`;
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(detector),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<UpdateDetectorResponse>;

    return response;
  };

  deleteDetector = async (detectorId: string): Promise<ServerResponse<DeleteDetectorResponse>> => {
    const url = `..${API.DETECTORS_BASE}/${detectorId}`;
    const response = (await this.httpClient.delete(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<DeleteDetectorResponse>;

    return response;
  };
}
