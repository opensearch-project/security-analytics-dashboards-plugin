/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
  ResponseError,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import {
  CreateLogTypeRequestBody,
  CreateLogTypeResponse,
  DeleteLogTypeParams,
  DeleteLogTypeResponse,
  LogTypeBase,
  SearchLogTypesResponse,
  UpdateLogTypeParams,
  UpdateLogTypeResponse,
} from '../../types';
import { CLIENT_LOGTYPE_METHODS } from '../utils/constants';

export class LogTypeService {
  constructor(private osDriver: ILegacyCustomClusterClient) {}

  createLogType = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, CreateLogTypeRequestBody>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<CreateLogTypeResponse> | ResponseError>
  > => {
    try {
      const logType = request.body;
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const createLogTypeResponse: CreateLogTypeResponse = await callWithRequest(
        CLIENT_LOGTYPE_METHODS.CREATE_LOGTYPE,
        { body: logType }
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createLogTypeResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - LogTypeService - createLogType:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  searchLogTypes = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<SearchLogTypesResponse> | ResponseError>
  > => {
    try {
      const query = request.body;
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const searchLogTypesResponse: SearchLogTypesResponse = await callWithRequest(
        CLIENT_LOGTYPE_METHODS.SEARCH_LOGTYPES,
        {
          body: {
            size: 10000,
            query: query ?? {
              match_all: {},
            },
          },
        }
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchLogTypesResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - LogTypeService - searchLogTypes:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  updateLogType = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ logTypeId: string }, unknown, LogTypeBase>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<UpdateLogTypeResponse> | ResponseError>
  > => {
    try {
      const logType = request.body;
      const { logTypeId } = request.params;
      const params: UpdateLogTypeParams = { body: logType, logTypeId };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      console.log(JSON.stringify(params));
      const updateLogTypeResponse: UpdateLogTypeResponse = await callWithRequest(
        CLIENT_LOGTYPE_METHODS.UPDATE_LOGTYPE,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: updateLogTypeResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - LogTypeService - updateLogType:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  deleteLogType = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ logTypeId: string }>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<DeleteLogTypeResponse> | ResponseError>
  > => {
    try {
      const { logTypeId } = request.params;
      const params: DeleteLogTypeParams = { logTypeId };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deleteLogTypeResponse: DeleteLogTypeResponse = await callWithRequest(
        CLIENT_LOGTYPE_METHODS.DELETE_LOGTYPE,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteLogTypeResponse,
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
}
