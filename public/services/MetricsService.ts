/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import _ from 'lodash';
import { MetricsCounter, PartialMetricsCounter } from '../../types';
import { API, DEFAULT_METRICS_COUNTER } from '../../server/utils/constants';
import { aggregateMetrics, getSecurityAnalyticsPluginConfig } from '../../common/helpers';

export class MetricsService {
  private newMetricsAvailable = false;
  private metricsCounter: MetricsCounter = _.cloneDeep(DEFAULT_METRICS_COUNTER);
  private emitTimer: NodeJS.Timer | undefined = undefined;
  private uxTelemetryIntervalInMs: number;

  constructor(private readonly httpClient: HttpSetup) {
    this.uxTelemetryIntervalInMs =
      (getSecurityAnalyticsPluginConfig()?.uxTelemetryInterval || 0) * 60000;
  }

  private emitMetrics = () => {
    if (this.newMetricsAvailable) {
      this.httpClient.post(`..${API.METRICS}`, {
        body: JSON.stringify(this.metricsCounter),
      });
      this.metricsCounter = _.cloneDeep(DEFAULT_METRICS_COUNTER);
    }

    this.newMetricsAvailable = false;
  };

  private setupEmitMetricsTimer() {
    if (this.emitTimer) {
      return;
    }

    this.emitTimer = setInterval(this.emitMetrics, this.uxTelemetryIntervalInMs);
    window.onbeforeunload = this.emitMetrics;
  }

  updateMetrics(metrics: PartialMetricsCounter) {
    if (!this.uxTelemetryIntervalInMs) {
      return;
    }

    this.metricsCounter = aggregateMetrics(metrics, this.metricsCounter);
    this.newMetricsAvailable = true;
    this.setupEmitMetricsTimer();
  }
}
