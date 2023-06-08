/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectReference, SimpleSavedObject } from 'opensearch-dashboards/public';
import { ServerResponse } from './ServerResponse';

export interface ISavedObjectsService {
  createSavedObject(
    name: string,
    logType: string,
    detectorId: string,
    inputIndices: string[]
  ): Promise<ServerResponse<SimpleSavedObject>>;
  getDashboards(): Promise<
    SimpleSavedObject<{ references: SavedObjectReference[]; id?: string }>[]
  >;
  getDashboard(
    detectorId: string
  ): Promise<Promise<SimpleSavedObject<SavedObjectReference>> | Promise<undefined>>;
  deleteDashboard(detectorId: string): Promise<any>;
  deleteVisualization(detectorId: string): Promise<any>;
}
