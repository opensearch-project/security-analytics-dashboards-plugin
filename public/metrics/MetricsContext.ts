/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import MetricsService from '../services/MetricsService';
import { DetectorMetricsManager } from './DetectorMetricsManager';

export class MetricsContext {
  public detectorMetricsManager: DetectorMetricsManager;

  constructor(metricsService: MetricsService) {
    this.detectorMetricsManager = new DetectorMetricsManager(metricsService);
  }
}
