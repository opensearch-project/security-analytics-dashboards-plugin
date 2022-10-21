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
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetFindingsResponse> | ResponseError>
  > => {
    try {
      const { detectorType } = request.query as { detectorType: string };
      const params: GetFindingsParams = { detectorType };
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
    } catch (e) {
      console.error('Security Analytics - FindingsService - getFindings:', e);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: e.message,
        },
      });
    }
  };
}
