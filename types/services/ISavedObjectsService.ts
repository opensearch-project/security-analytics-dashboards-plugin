/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimpleSavedObject } from 'opensearch-dashboards/public';
import { ServerResponse } from './ServerResponse';

export interface ISavedObjectsService {
  createSavedObject(logType: string): Promise<ServerResponse<SimpleSavedObject>>;
}
