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
import {
  CreateDetectorParams,
  CreateDetectorResponse,
  DeleteDetectorParams,
  DeleteDetectorResponse,
  GetDetectorParams,
  GetDetectorResponse,
  SearchDetectorsParams,
  SearchDetectorsResponse,
  UpdateDetectorParams,
  UpdateDetectorResponse,
} from '../models/interfaces';
import { CLIENT_DETECTOR_METHODS } from '../utils/constants';
import { Detector } from '../../models/interfaces';
import { ServerResponse } from '../models/types';
import { Query } from '@elastic/eui';

export default class DetectorService {
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

  /**
   * Calls backend GET Detector API.
   */
  getDetector = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetDetectorResponse> | ResponseError>
  > => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const params: GetDetectorParams = { detectorId };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getDetectorResponse: GetDetectorResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.GET_DETECTOR,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getDetectorResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DetectorsService - getDetector:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  /**
   * Calls backend Search Detector API.
   */
  searchDetectors = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchDetectorsResponse> | ResponseError>
  > => {
    try {
      const { query } = request.body as { query: Query };
      const params: SearchDetectorsParams = { body: { query } };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const searchDetectorResponse: SearchDetectorsResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.SEARCH_DETECTORS,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchDetectorResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DetectorsService - searchDetectors:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  /**
   * Calls backend DELETE Detector API.
   */
  deleteDetector = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<DeleteDetectorResponse> | ResponseError>
  > => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const params: DeleteDetectorParams = { detectorId };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deleteDetectorResponse: DeleteDetectorResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.DELETE_DETECTOR,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteDetectorResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DetectorsService - deleteDetector:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  /**
   * Calls backend PUT Detectors API.
   */
  updateDetector = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<UpdateDetectorResponse> | ResponseError>
  > => {
    try {
      const detector = request.body as Detector;
      const params: UpdateDetectorParams = { body: detector };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const updateDetectorResponse: UpdateDetectorResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.UPDATE_DETECTOR,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: updateDetectorResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - DetectorsService - updateDetector:', error);
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
