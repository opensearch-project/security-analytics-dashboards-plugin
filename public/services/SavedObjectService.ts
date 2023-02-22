/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SavedObjectReference,
  SavedObjectsClientContract,
  SimpleSavedObject,
} from 'opensearch-dashboards/public';
import { IIndexService, ISavedObjectsService, ServerResponse } from '../../types';
import { getSavedObjectConfigs } from '../store/savedObjectsConfig';
import { logTypesWithDashboards } from '../utils/constants';

export default class SavedObjectService implements ISavedObjectsService {
  constructor(
    private savedObjectsClient: SavedObjectsClientContract,
    private readonly indexService: IIndexService
  ) {}

  public async createSavedObject(
    name: string,
    logType: string,
    detectorId: string,
    inputIndices: string[]
  ): Promise<ServerResponse<SimpleSavedObject>> {
    if (logTypesWithDashboards.has(logType)) {
      const savedObjectConfig = getSavedObjectConfigs(logType);

      if (savedObjectConfig) {
        try {
          // Determine the name to be used for the index pattern and if it already exists then use that id for visualizations
          const aliasName = `${logType}-${detectorId}`;
          const indexActions = inputIndices.map((index) => {
            return {
              add: {
                index,
                alias: aliasName,
              },
            };
          });
          const createAliasRes = await this.indexService.updateAliases({
            actions: indexActions,
          });

          const indexPattern = await this.savedObjectsClient.create(
            savedObjectConfig['index-pattern'].type,
            {
              ...savedObjectConfig['index-pattern'].attributes,
              title: aliasName,
            },
            {
              ...savedObjectConfig['index-pattern'],
            }
          );

          const visCreationPromises = savedObjectConfig.visualizations.map(
            (visualizationConfig) => {
              return this.savedObjectsClient.create(
                visualizationConfig.type,
                visualizationConfig.attributes,
                {
                  ...visualizationConfig,
                  references: visualizationConfig.references.map((ref) => {
                    return {
                      ...ref,
                      id: indexPattern.id,
                    };
                  }),
                }
              );
            }
          );

          const visCreationRes = await Promise.allSettled(visCreationPromises);
          const dashboardReferences = savedObjectConfig.dashboard.references.map((ref, index) => {
            const createdVisRes = visCreationRes[index];
            if (createdVisRes.status === 'fulfilled') {
              return {
                ...ref,
                id: createdVisRes.value.id,
              };
            }

            return ref;
          });
          dashboardReferences.push({
            id: detectorId,
            name: name,
            type: 'detector-SA',
          });

          const dashboardCreationRes = await this.savedObjectsClient.create(
            savedObjectConfig.dashboard.type,
            {
              ...savedObjectConfig.dashboard.attributes,
              title: `${name} summary`,
              description: `Analyze ${logType} log data in security detector ${name}`,
            },
            {
              ...savedObjectConfig.dashboard,
              references: dashboardReferences,
            }
          );

          return Promise.resolve({
            ok: true,
            response: dashboardCreationRes,
          });
        } catch (error: any) {
          console.error('Failed to create dashboard for log type ' + logType);
        }
      }
    }

    return Promise.reject('Log type not yet supported');
  }

  public getDashboards = async (): Promise<
    SimpleSavedObject<{ references: SavedObjectReference[]; id?: string }>[]
  > => {
    const dashboards = await this.savedObjectsClient
      .find<{ references: SavedObjectReference[]; id?: string }>({
        type: 'dashboard',
        fields: ['references', 'id'],
        perPage: 10000,
      })
      .then((response) => response.savedObjects);

    return Promise.resolve(dashboards);
  };

  public async getIndexPatterns(): Promise<SimpleSavedObject<{ title: string }>[]> {
    const indexPatterns = await this.savedObjectsClient
      .find<{ title: string }>({
        type: 'index-pattern',
        fields: ['title', 'type'],
        perPage: 10000,
      })
      .then((response) => response.savedObjects);

    return Promise.resolve(indexPatterns);
  }
}
