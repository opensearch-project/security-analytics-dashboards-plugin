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
import { ServerResponse } from '../models/types';
import { CLIENT_DETECTOR_METHODS } from '../utils/constants';
import { GetFindingsParams, GetFindingsResponse } from '../../types';

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
      const params: GetFindingsParams = { ...request.query };
      console.log(JSON.stringify(params));
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getFindingsResponse: GetFindingsResponse = await callWithRequest(
        CLIENT_DETECTOR_METHODS.GET_FINDINGS,
        params
      );

      getFindingsResponse.findings.forEach((finding: any) => {
        const types: string[] = [];
        if (!finding.queries.every((query: any) => query.id.startsWith('threat_intel_'))) {
          types.push('Detection rules');
        }
        if (finding.queries.some((query: any) => query.id.startsWith('threat_intel_'))) {
          types.push('Threat intelligence');
          finding['ruleSeverity'] = 'high';
        }

        finding['detectionType'] = types.join(', ');
      });

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
