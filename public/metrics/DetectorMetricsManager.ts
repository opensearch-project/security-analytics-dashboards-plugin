/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateDetectorSteps, CreateDetectorStepValue } from '../../types';
import MetricsService from '../services/MetricsService';

export class DetectorMetricsManager {
  private static initialCheckpoint = CreateDetectorStepValue[CreateDetectorSteps.notStarted];
  private stepsLogged: number = DetectorMetricsManager.initialCheckpoint;
  private creationStartedStepValue = CreateDetectorStepValue[CreateDetectorSteps.started];

  constructor(private readonly metricsService: MetricsService) {}

  public sendMetrics(step: CreateDetectorSteps, stepNameForCounter?: string) {
    const stepValue = CreateDetectorStepValue[step];

    // If we are not in detection creation flow, we should not emit any metric
    if (
      stepValue !== this.creationStartedStepValue &&
      !this.metricEmittedForStep(this.creationStartedStepValue)
    ) {
      return;
    }

    // Checks if we have already emitted metrics for this step
    if (!this.metricEmittedForStep(stepValue)) {
      this.metricsService.updateMetrics({
        CreateDetector: {
          [stepNameForCounter || step]: 1,
        },
      });
      this.stepsLogged |= stepValue;
    }
  }

  public resetMetrics() {
    this.stepsLogged = DetectorMetricsManager.initialCheckpoint;
  }

  private metricEmittedForStep(stepValue: number): boolean {
    return (this.stepsLogged & stepValue) === stepValue;
  }
}
