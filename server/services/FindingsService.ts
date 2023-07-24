/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
} from 'opensearch-dashboards/server';
import { GetFindingsParams, GetFindingsResponse } from '../models/interfaces';
import { ServerResponse } from '../models/types';
import { CLIENT_DETECTOR_METHODS } from '../utils/constants';

export default class FindingsService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend GET Findings API.
   */
  getFindings = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetFindingsParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetFindingsResponse> | ResponseError>
  > => {
    try {
      const { detectorType, detectorId, sortOrder, size } = request.query;
      const defaultParams = {
        sortOrder,
        size,
      };
      let params: GetFindingsParams;

      if (detectorId) {
        params = {
          ...defaultParams,
          detectorId,
        };
      } else if (detectorType) {
        params = {
          ...defaultParams,
          detectorType,
        };
      } else {
        throw Error(`Invalid request params: detectorId or detectorType must be specified`);
      }

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getFindingsResponse: GetFindingsResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.GET_FINDINGS,
        params
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getFindingsResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - FindingsService - getFindings:', error);
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
