/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type GetAlertsParams =
  | {
      detectorId: string;
      detectorType?: string;
    }
  | {
      detectorType: string;
      detectorId?: string;
    };

export interface GetAlertsResponse {}
