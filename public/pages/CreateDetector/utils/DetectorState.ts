/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector } from '../../../../types';
import { CreateDetectorState } from '../containers/CreateDetector';

export interface IDetectorState {
  setPendingState: (state: IDetectorPendingState) => void;
  deletePendingState: () => void;
  getPendingState: () => void;
}

export interface IDetectorPendingState {
  pendingRequests?: Promise<any>[];
  detector?: Detector;
  detectorState?: CreateDetectorState;
}

class DetectorState implements IDetectorState {
  private state: IDetectorPendingState | undefined;

  public static instance: DetectorState;

  constructor() {
    !DetectorState.instance && (DetectorState.instance = this);
  }

  public setPendingState = (state: IDetectorPendingState) => {
    this['state'] = state;
  };

  public getPendingState = () => {
    if (!this.state) return {};
    return {
      ...this.state,
    };
  };

  public deletePendingState = () => {
    delete this.state;
  };
}

export default DetectorState.instance || new DetectorState();
