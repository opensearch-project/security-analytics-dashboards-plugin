/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type GetFindingsParams =
  | {
      detectorId: string;
      detectorType?: string;
    }
  | {
      detectorType: string;
      detectorId?: string;
    };

export interface GetFindingsResponse {
  detector_id: string;
  total_findings: number;
  findings: Finding[];
}
