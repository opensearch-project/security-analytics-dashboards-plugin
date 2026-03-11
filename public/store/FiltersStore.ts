/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  FilterItem,
  FilterSearchRequest,
  FilterSearchResponse,
  ServerResponse,
  CreateFilterPayload,
  UpdateFilterPayload,
  CUDFilterResponse,
} from '../../types';
import FiltersService from '../services/FiltersService';
import { errorNotificationToast } from '../utils/helpers';

export class FiltersStore {
  constructor(private service: FiltersService, private notifications: NotificationsStart) {}

  public async searchFilters(
    params: FilterSearchRequest
  ): Promise<{ items: FilterItem[]; total: number }> {
    try {
      const response: ServerResponse<FilterSearchResponse> = await this.service.searchFilters(
        params
      );
      if (!response.ok) {
        errorNotificationToast(this.notifications, 'fetch', 'Filters', response.error);
        return { items: [], total: 0 };
      }

      const hits = response.response.hits.hits ?? [];
      const total =
        typeof response.response.hits.total === 'number'
          ? response.response.hits.total
          : response.response.hits.total?.value ?? hits.length;
      const items: FilterItem[] = hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      }));

      return { items, total };
    } catch (error: any) {
      errorNotificationToast(this.notifications, 'fetch', 'Filters', error.message);
      return { items: [], total: 0 };
    }
  }

  public async getFilter(id: string): Promise<FilterItem | undefined> {
    const response = await this.service.searchFilters({
      size: 1,
      query: { ids: { values: [id] } },
    });
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'fetch', 'filter', response.error);
      return undefined;
    }
    const hit = response.response.hits.hits?.[0];
    if (!hit) return undefined;
    return { id: hit._id, ...hit._source };
  }

  public async createFilter(body: CreateFilterPayload): Promise<CUDFilterResponse | undefined> {
    const response = await this.service.createFilter(body);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'create', 'filter', response.error);
      return undefined;
    }
    return response.response;
  }

  public async updateFilter(
    filterId: string,
    body: UpdateFilterPayload
  ): Promise<CUDFilterResponse | undefined> {
    const response = await this.service.updateFilter(filterId, body);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'update', 'filter', response.error);
      return undefined;
    }
    return response.response;
  }

  public async deleteFilter(filterId: string): Promise<CUDFilterResponse | undefined> {
    const response = await this.service.deleteFilter(filterId);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'delete', 'filter', response.error);
      return undefined;
    }
    return response.response;
  }
}
