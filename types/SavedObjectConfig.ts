/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SavedObjectReference,
  SavedObjectsMigrationVersion,
  SavedObjectAttributes,
} from '../../../src/core/public';

interface SavedObjectCreationConfigBase {
  references: SavedObjectReference[];
  migrationVersion?: SavedObjectsMigrationVersion;
  id?: string;
}

export interface IndexPatternSavedObjectCreationConfig extends SavedObjectCreationConfigBase {
  type: 'index-pattern';
  attributes: {
    fields: string;
    timeFieldName: string;
    title: string;
  };
}

export interface VisualizationSavedObjectCreationConfig extends SavedObjectCreationConfigBase {
  type: 'visualization';
  attributes: SavedObjectAttributes & {
    title: string;
    description: string;
    uiStateJSON: string;
    visState: string;
    kibanaSavedObjectMeta: {
      searchSourceJSON: string;
    };
  };
}

export interface DashboardSavedObjectCreationConfig extends SavedObjectCreationConfigBase {
  type: 'dashboard';
  attributes: SavedObjectAttributes & {
    title: string;
    description: string;
    hits: number;
    optionsJSON: string;
    panelsJSON: string;
    timeRestore: boolean;
    kibanaSavedObjectMeta: {
      searchSourceJSON: string;
    };
  };
}

export type SavedObjectCreationConfig =
  | IndexPatternSavedObjectCreationConfig
  | VisualizationSavedObjectCreationConfig
  | DashboardSavedObjectCreationConfig;

export type DashboardCreationConfig = {
  'index-pattern': IndexPatternSavedObjectCreationConfig;
  visualizations: VisualizationSavedObjectCreationConfig[];
  dashboard: DashboardSavedObjectCreationConfig;
};
