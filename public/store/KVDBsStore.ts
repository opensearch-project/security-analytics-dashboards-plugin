/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  CreateKVDBPayload,
  CUDKVDBResponse,
  KVDBIntegrationSummary,
  KVDBIntegrationsSearchResponse,
  KVDBItem,
  KVDBSearchRequest,
  KVDBSearchResponse,
  ServerResponse,
  UpdateKVDBPayload,
} from '../../types';
import KVDBsService from '../services/KVDBsService';
import { errorNotificationToast } from '../utils/helpers';

export class KVDBsStore {
  constructor(
    private service: KVDBsService,
    private notifications: NotificationsStart
  ) {}

  public async searchKVDBs(
    params: KVDBSearchRequest
  ): Promise<{ items: KVDBItem[]; total: number }> {
    try {
      const response: ServerResponse<KVDBSearchResponse> = await this.service.searchKVDBs(params);
      if (!response.ok) {
        errorNotificationToast(this.notifications, 'fetch', 'KVDBs', response.error);
        return { items: [], total: 0 };
      }

      const hits = response.response.hits.hits ?? [];
      const total =
        typeof response.response.hits.total === 'number'
          ? response.response.hits.total
          : (response.response.hits.total?.value ?? hits.length);
      const items: KVDBItem[] = hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      }));

      const kvdbIds = Array.from(
        new Set(items.map((item) => item.document?.id).filter((id): id is string => Boolean(id)))
      );

      const integrationsMap = await this.getIntegrationsMap(kvdbIds);

      const itemsWithIntegration = items.map((item) => ({
        ...item,
        integration: integrationsMap.get(item.document?.id ?? '') ?? undefined,
      }));

      return { items: itemsWithIntegration, total };
    } catch (error: any) {
      errorNotificationToast(this.notifications, 'fetch', 'KVDBs', error.message);
      return { items: [], total: 0 };
    }
  }

  public async getKVDB(id: string): Promise<KVDBItem | undefined> {
    const response: ServerResponse<KVDBSearchResponse> = await this.service.searchKVDBs({
      size: 1,
      query: {
        ids: {
          values: [id],
        },
      },
    });

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'fetch', 'KVDB', response.error);
      return undefined;
    }

    const hit = response.response.hits.hits?.[0];
    if (!hit) {
      return undefined;
    }

    const item: KVDBItem = {
      id: hit._id,
      ...hit._source,
    };

    const integrationsMap = await this.getIntegrationsMap(
      item.document?.id ? [item.document.id] : []
    );

    return {
      ...item,
      integration: integrationsMap.get(item.document?.id ?? '') ?? undefined,
    };
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string') return error;
    const err = error as { body?: { message?: string }; message?: string };
    return err?.body?.message ?? err?.message ?? fallback;
  }

  public async createKVDB(body: CreateKVDBPayload): Promise<CUDKVDBResponse | undefined> {
    try {
      const response = await this.service.createKVDB(body);
      if (!response.ok) {
        errorNotificationToast(
          this.notifications,
          'create',
          'KVDB',
          this.getErrorMessage(response.error, 'Failed to create KVDB')
        );
        return undefined;
      }
      return response.response;
    } catch (error: unknown) {
      errorNotificationToast(
        this.notifications,
        'create',
        'KVDB',
        this.getErrorMessage(error, 'An unexpected error occurred.')
      );
      return undefined;
    }
  }

  public async updateKVDB(
    kvdbId: string,
    body: UpdateKVDBPayload
  ): Promise<CUDKVDBResponse | undefined> {
    try {
      const response = await this.service.updateKVDB(kvdbId, body);
      if (!response.ok) {
        errorNotificationToast(
          this.notifications,
          'update',
          'KVDB',
          this.getErrorMessage(response.error, 'Failed to update KVDB')
        );
        return undefined;
      }
      return response.response;
    } catch (error: unknown) {
      errorNotificationToast(
        this.notifications,
        'update',
        'KVDB',
        this.getErrorMessage(error, 'An unexpected error occurred.')
      );
      return undefined;
    }
  }

  public async deleteKVDB(kvdbId: string): Promise<CUDKVDBResponse | undefined> {
    try {
      const response = await this.service.deleteKVDB(kvdbId);
      if (!response.ok) {
        errorNotificationToast(
          this.notifications,
          'delete',
          'KVDB',
          this.getErrorMessage(response.error, 'Failed to delete KVDB')
        );
        return undefined;
      }
      return response.response;
    } catch (error: unknown) {
      errorNotificationToast(
        this.notifications,
        'delete',
        'KVDB',
        this.getErrorMessage(error, 'An unexpected error occurred.')
      );
      return undefined;
    }
  }

  private async getIntegrationsMap(
    kvdbIds: string[]
  ): Promise<Map<string, KVDBIntegrationSummary>> {
    if (!kvdbIds.length) {
      return new Map();
    }

    const response: ServerResponse<KVDBIntegrationsSearchResponse> =
      await this.service.searchIntegrations(kvdbIds);

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'fetch', 'integrations', response.error);
      return new Map();
    }

    const integrationsMap = new Map<string, KVDBIntegrationSummary>();
    const hits = response.response.hits.hits ?? [];

    hits.forEach((hit) => {
      const integration = hit._source;
      const integrationId = integration.document?.id ?? hit._id;
      const integrationTitle = integration.document?.metadata?.title;
      const related = integration.document?.kvdbs ?? [];
      const relatedIds = Array.isArray(related) ? related : [related];

      relatedIds.forEach((kvdbId) => {
        if (!kvdbId || integrationsMap.has(kvdbId)) {
          return;
        }
        integrationsMap.set(kvdbId, {
          id: integrationId,
          title: integrationTitle,
        });
      });
    });

    return integrationsMap;
  }
}
