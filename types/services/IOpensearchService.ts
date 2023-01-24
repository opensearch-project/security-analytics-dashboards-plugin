/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from './ServerResponse';
import { SimpleSavedObject } from 'opensearch-dashboards/public';

export interface IOpenSearchService {
  getPlugins(): Promise<ServerResponse<Plugin[]>>;
  getIndexPatterns(): Promise<SimpleSavedObject<{ title: string }>[]>;
}
