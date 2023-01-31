/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsClientContract, SimpleSavedObject } from 'opensearch-dashboards/public';
import { ISavedObjectsService, ServerResponse } from '../../types';
import { getSavedObjectConfigs } from '../store/savedObjectsConfig';

export default class SavedObjectService implements ISavedObjectsService {
  private supportedLogTypes = new Set(['network', 'cloudtrail', 's3']);

  constructor(private savedObjectsClient: SavedObjectsClientContract) {}

  public async createSavedObject(logType: string): Promise<ServerResponse<SimpleSavedObject>> {
    if (this.supportedLogTypes.has(logType)) {
      const savedObjectConfig = getSavedObjectConfigs(logType);

      if (savedObjectConfig) {
        try {
          const indexPattern = await this.savedObjectsClient.create(
            savedObjectConfig['index-pattern'].type,
            savedObjectConfig['index-pattern'].attributes,
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

          const dashboardCreationRes = await this.savedObjectsClient.create(
            savedObjectConfig.dashboard.type,
            savedObjectConfig.dashboard.attributes,
            {
              ...savedObjectConfig.dashboard,
              references: savedObjectConfig.dashboard.references.map((ref, index) => {
                const createdVisRes = visCreationRes[index];
                if (createdVisRes.status === 'fulfilled') {
                  return {
                    ...ref,
                    id: createdVisRes.value.id,
                  };
                }

                return ref;
              }),
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
}
