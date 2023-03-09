/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from '../../../../server/models/types';
import { CreateMappingsResponse } from '../../../../server/models/interfaces';
import { CreateDetectorResponse } from '../../../../types';

export class DetectorState {
  static state: {
    promises: [ServerResponse<CreateMappingsResponse>, ServerResponse<CreateDetectorResponse>];
    data: any;
  } | null;

  public static setState = (
    promises: [ServerResponse<CreateMappingsResponse>, ServerResponse<CreateDetectorResponse>],
    data: any
  ) => {
    DetectorState.state = {
      promises,
      data,
    };
  };

  public static getState = () => DetectorState.state;

  public static deleteState = () => {
    DetectorState.state = null;
  };
}
