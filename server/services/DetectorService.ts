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
import { ServerResponse } from '../models/types';
import { Detector } from '../../types';
import { MDSEnabledClientService } from './MDSEnabledClientService';

export default class DetectorService extends MDSEnabledClientService {
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
      const client = this.getClient(request, _context);
      const createDetectorResponse: CreateDetectorResponse = await client(
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
      const client = this.getClient(request, _context);
      const getDetectorResponse: GetDetectorResponse = await client(
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
      const { query } = request.body as { query: object };
      const params: SearchDetectorsParams = { body: { size: 10000, query } };
      const client = this.getClient(request, _context);
      const searchDetectorResponse: SearchDetectorsResponse = await client(
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
      const client = this.getClient(request, _context);
      const deleteDetectorResponse: DeleteDetectorResponse = await client(
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
      const { detectorId } = request.params as { detectorId: string };
      const params: UpdateDetectorParams = { body: detector, detectorId };
      const client = this.getClient(request, _context);
      const updateDetectorResponse: UpdateDetectorResponse = await client(
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
