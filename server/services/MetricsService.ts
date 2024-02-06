/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
  ResponseError,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import { MetricsCounter, PartialMetricsCounter } from '../../types';
import { DEFAULT_METRICS_COUNTER } from '../utils/constants';
import _ from 'lodash';
import { aggregateMetrics } from '../../common/helpers';

let metricsCounter: MetricsCounter = _.cloneDeep(DEFAULT_METRICS_COUNTER);

export default class MetricsService {
  async getMetrics(
    _context: RequestHandlerContext,
    _request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<MetricsCounter> | ResponseError>> {
    const metricsSnapshot = {
      ...metricsCounter,
    };

    metricsCounter = _.cloneDeep(DEFAULT_METRICS_COUNTER);

    return response.custom({
      statusCode: 200,
      body: {
        ok: true,
        response: metricsSnapshot,
      },
    });
  }

  async updateMetrics(
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, {}, Partial<PartialMetricsCounter>>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    const metrics = request.body;
    metricsCounter = aggregateMetrics(metrics, metricsCounter);

    return response.ok({
      body: metricsCounter,
    });
  }
}
