/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from './ServerResponse';
import { GetIndicesResponse } from '../Indices';

export interface IIndexService {
  getIndices(): Promise<ServerResponse<GetIndicesResponse>>;
  updateAliases(actions: any): Promise<ServerResponse<{}>>;
}
