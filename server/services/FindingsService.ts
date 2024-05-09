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
import { ServerResponse } from '../models/types';
import { CLIENT_DETECTOR_METHODS } from '../utils/constants';
import { DataSourceRequestParams, GetFindingsParams, GetFindingsResponse } from '../../types';
import { MDSEnabledClientService } from './MDSEnabledClientService';

export default class FindingsService extends MDSEnabledClientService {
  /**
   * Calls backend GET Findings API.
   */
  getFindings = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetFindingsParams & DataSourceRequestParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetFindingsResponse> | ResponseError>
  > => {
    try {
      const params: GetFindingsParams & DataSourceRequestParams = { ...request.query };
      const client = this.getClient(request, context);
      // Delete the dataSourceId since this query param is not supported by the finding API
      delete params['dataSourceId'];
      const getFindingsResponse: GetFindingsResponse = await client(
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
