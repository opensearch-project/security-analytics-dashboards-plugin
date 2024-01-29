/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { PartialMetricsCounter } from '../../types';
import { API } from '../../server/utils/constants';

export default class MetricsService {
  constructor(private readonly httpClient: HttpSetup) {}

  updateMetrics(metrics: PartialMetricsCounter) {
    this.httpClient.post(`..${API.METRICS}`, {
      body: JSON.stringify(metrics),
    });
  }
}
