/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  GetPromote,
  GetPromoteBySpaceResponse,
  Integration,
  IntegrationBase,
  IntegrationWithRules,
  PromoteIntegrationRequestBody,
  RuleItemInfoBase,
} from '../../types';
import IntegrationService from '../services/IntegrationService';
import { errorNotificationToast } from '../utils/helpers';
import { DataStore } from './DataStore';
import { ruleTypes } from '../pages/Rules/utils/constants';
import {
  DATA_SOURCE_NOT_SET_ERROR,
  integrationCategoryFilters,
  integrationsByCategories,
} from '../utils/constants';
import { getIntegrationLabel } from '../pages/Integrations/utils/helpers';

export class IntegrationStore {
  constructor(private service: IntegrationService, private notifications: NotificationsStart) {}

  private formatRelatedEntitiesList(entities: string[]): string {
    if (entities.length === 0) {
      return 'related entities';
    }

    if (entities.length === 1) {
      return entities[0];
    }

    if (entities.length === 2) {
      return `${entities[0]} and ${entities[1]}`;
    }

    return `${entities.slice(0, -1).join(', ')}, and ${entities[entities.length - 1]}`;
  }

  public async getIntegration(
    id: string,
    spaceFilter?: string | null
  ): Promise<IntegrationWithRules | undefined> {
    const integrationsRes = await this.service.searchIntegrations({ id, spaceFilter });
    if (integrationsRes.ok) {
      const integrations: Integration[] = integrationsRes.response.hits.hits.map((hit) => {
        return {
          id: hit._id,
          ...hit._source,
        };
      });

      let detectionRules: RuleItemInfoBase[] = [];

      if (integrations[0]) {
        const integrationName = integrations[0].document.title.toLowerCase();
        detectionRules = await DataStore.rules.getAllRules({
          'rule.category': [integrationName],
        });
      }

      return { ...integrations[0], detectionRules };
    }

    return undefined;
  }

  public async getIntegrations(spaceFilter: string): Promise<Integration[]> {
    try {
      const integrationsRes = await this.service.searchIntegrations({
        spaceFilter,
      });
      if (integrationsRes.ok) {
        const integrations: Integration[] = integrationsRes.response.hits.hits.map((hit) => {
          return {
            id: hit._id,
            ...hit._source,
            space: hit._source.space,
          };
        });

        ruleTypes.splice(
          0,
          ruleTypes.length,
          ...integrations
            .map(({ id, document: { category, title }, space }) => ({
              label: getIntegrationLabel(title),
              value: title,
              id,
              category,
              isStandard: space.name === 'Standard',
            }))
            .sort((a, b) => {
              return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
            })
        );

        // Set integration category types
        for (const key in integrationsByCategories) {
          delete integrationsByCategories[key];
        }
        integrations.forEach((integration) => {
          integrationsByCategories[integration.document.category] =
            integrationsByCategories[integration.document.category] || [];
          integrationsByCategories[integration.document.category].push(integration);
        });
        integrationCategoryFilters.splice(
          0,
          integrationCategoryFilters.length,
          ...Object.keys(integrationsByCategories).sort((a, b) => {
            if (a === 'Other') {
              return 1;
            } else if (b === 'Other') {
              return -1;
            } else {
              return a < b ? -1 : a > b ? 1 : 0;
            }
          })
        );

        return integrations;
      }

      return [];
    } catch (error: any) {
      if (error.message === DATA_SOURCE_NOT_SET_ERROR) {
        errorNotificationToast(
          this.notifications,
          'Fetch',
          'Integrations',
          'Select valid data source.'
        );
        return [];
      }

      throw error;
    }
  }

  public async createIntegration(integration: IntegrationBase): Promise<boolean> {
    const createRes = await this.service.createIntegration(integration);

    if (!createRes.ok) {
      errorNotificationToast(
        this.notifications,
        'create',
        'integration',
        createRes?.error?.message || createRes.error // TODO: I am not sure about the error structure here
      );
    }

    return createRes.ok;
  }

  public async updateIntegration(integrationId: string, document: Integration): Promise<boolean> {
    const updateRes = await this.service.updateIntegration(integrationId, document);

    if (!updateRes.ok) {
      errorNotificationToast(this.notifications, 'update', 'integration', updateRes.error);
    }

    return updateRes.ok;
  }

  public async deleteIntegration(id: string) {
    try {
      const deleteRes = await this.service.deleteIntegration(id);

      if (!deleteRes.ok) {
        errorNotificationToast(
          this.notifications,
          'delete',
          'integration',
          deleteRes.error.message || 'Error occurred while deleting integration.'
        );
      }

      return { ok: deleteRes.ok, error: deleteRes.error || null };
    } catch (e: any) {
      errorNotificationToast(
        this.notifications,
        'delete',
        'integration',
        e?.message || 'An unexpected error occurred.'
      );
      return { ok: false, error: { message: e?.message || 'An unexpected error occurred.' } };
    }
  }

  public async getPromote(
    data: GetPromote
  ): Promise<[GetPromoteBySpaceResponse['ok'], GetPromoteBySpaceResponse['response']]> {
    const promoteRes = await this.service.getPromoteIntegration(data);
    if (!promoteRes.ok) {
      errorNotificationToast(
        this.notifications,
        'promote',
        'integration',
        promoteRes.error.message || promoteRes.error
      );
    }

    return [promoteRes.ok, promoteRes.response];
  }

  public async promoteIntegration(data: PromoteIntegrationRequestBody) {
    const promoteRes = await this.service.promoteIntegration(data);
    if (!promoteRes.ok) {
      errorNotificationToast(this.notifications, 'promote', 'integration', promoteRes.error);
    }

    return promoteRes.ok;
  }

  /**
   * This method checks if an integration can be deleted.
   * An integration can be deleted if it has no associated rules, decoders or KVDB items.
   */
  public canDeleteIntegration(integration: Integration): boolean {
    const rules = (integration as Integration & { rules?: unknown }).rules;
    const decoders = (integration as Integration & { decoders?: unknown }).decoders;
    const kvdbs = (integration as Integration & { kvdbs?: unknown }).kvdbs;
    const rulesCount = Array.isArray(rules) ? rules.length : 0;
    const decodersCount = Array.isArray(decoders) ? decoders.length : 0;
    const kvdbsCount = Array.isArray(kvdbs) ? kvdbs.length : 0;
    return rulesCount === 0 && decodersCount === 0 && kvdbsCount === 0;
  }

  public getRelatedEntitiesMessage({
    hasRules,
    hasDecoders,
    hasKVDBs,
  }: {
    hasRules: boolean;
    hasDecoders: boolean;
    hasKVDBs: boolean;
  }): string {
    const relatedEntities = [
      hasRules ? 'detection rules' : null,
      hasDecoders ? 'decoders' : null,
      hasKVDBs ? 'KVDBs' : null,
    ].filter(Boolean) as string[];

    return this.formatRelatedEntitiesList(relatedEntities);
  }
}
