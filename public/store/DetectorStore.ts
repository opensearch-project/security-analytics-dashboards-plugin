/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorHit, IDetectorService } from '../../types';

export class DetectorStore {
  private _detectors: DetectorHit[] = [];

  constructor(private readonly detectorService: IDetectorService) {}

  public get detectors() {
    return this._detectors;
  }

  public addDetector() {}

  public removeDetector() {}

  public updateDetector() {}

  private updateDetectors() {}

  private fetchDetectors() {}
}
