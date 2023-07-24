/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Finding } from '../../../public/pages/Findings/models/interfaces';

export type GetFindingsParams = {
  sortOrder?: string;
  size?: number;
} & (
  | {
      detectorId: string;
      detectorType?: string;
    }
  | {
      detectorType: string;
      detectorId?: string;
    }
);

export interface GetFindingsResponse {
  total_findings: number;
  findings: Finding[];
}
