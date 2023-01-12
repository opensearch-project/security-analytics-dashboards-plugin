/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetFindingsParams, GetFindingsResponse } from '../Finding';
import { ServerResponse } from './ServerResponse';

export interface IFindingService {
  getFindings(detectorParams: GetFindingsParams): Promise<ServerResponse<GetFindingsResponse>>;
}
