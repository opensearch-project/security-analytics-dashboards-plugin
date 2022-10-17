/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
  ILegacyCustomClusterClient,
} from 'opensearch-dashboards/server';
import { CreateDetectorParams, CreateDetectorResponse } from '../models/interfaces';
import { CLIENT_DETECTOR_METHODS } from '../utils/constants';
import { Detector } from '../../models/interfaces';
import { ServerResponse } from '../models/types';

export default class DetectorsService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend POST Detectors API.
   */
  createDetector = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<CreateDetectorResponse> | ResponseError>
  > => {
    try {
      const detector = request.body as Detector;
      const params: CreateDetectorParams = { body: detector };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const createDetectorResponse: CreateDetectorResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.CREATE_DETECTOR,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createDetectorResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DetectorsService - createDetector:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };
}
