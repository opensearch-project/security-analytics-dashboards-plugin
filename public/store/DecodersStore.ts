/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { CUDDecoderResponse, DecoderItem, SearchDecodersResponse } from '../../types';
import DecodersService from '../services/DecodersService';
import { errorNotificationToast } from '../utils/helpers';

export interface DecodersSearchParams {
  from?: number;
  size?: number;
  sort?: any;
  query?: any;
  _source?: any;
}

export class DecodersStore {
  constructor(private service: DecodersService, private notifications: NotificationsStart) {}

  public async searchDecoders(
    params: DecodersSearchParams,
    space?: string
  ): Promise<SearchDecodersResponse> {
    const response = await this.service.searchDecoders(params, space);
    if (!response.ok) {
      if (
        response.error?.includes('index_not_found_exception') ||
        response.error?.includes('no such index')
      ) {
        return { total: 0, items: [] };
      }
      errorNotificationToast(this.notifications, 'retrieve', 'decoders', response.error);
      return { total: 0, items: [] };
    }

    const items: DecoderItem[] = response.response.items.map((item) => ({
      ...item,
      space:
        this.service.normalizeSpace(item.space) ??
        this.service.normalizeSpace(item.document?.space),
    }));

    return { ...response.response, items };
  }

  public async getDecoder(decoderId: string, space?: string): Promise<DecoderItem | undefined> {
    const response = await this.service.getDecoder(decoderId, space);
    if (!response.ok) {
      if (
        response.error?.includes('index_not_found_exception') ||
        response.error?.includes('no such index')
      ) {
        return undefined;
      }
      errorNotificationToast(this.notifications, 'retrieve', 'decoder', response.error);
      return undefined;
    }

    const item = response.response.item;
    if (!item) {
      return undefined;
    }

    return {
      ...item,
      space:
        this.service.normalizeSpace(item.space) ??
        this.service.normalizeSpace(item.document?.space),
    };
  }

  public async createDecoder(body: {
    document: any;
    integrationId: string;
  }): Promise<CUDDecoderResponse | undefined> {
    const responseRequest = await this.service.createDecoder(body);
    if (!responseRequest.ok) {
      errorNotificationToast(this.notifications, 'create', 'decoder', responseRequest.error);
      return undefined;
    }
    return responseRequest.response;
  }

  public async updateDecoder(
    decoderId: string,
    body: { document: any }
  ): Promise<CUDDecoderResponse | undefined> {
    const responseRequest = await this.service.updateDecoder(decoderId, body);
    if (!responseRequest.ok) {
      errorNotificationToast(this.notifications, 'update', 'decoder', responseRequest.error);
      return undefined;
    }
    return responseRequest.response;
  }

  public async deleteDecoder(decoderId: string): Promise<CUDDecoderResponse | undefined> {
    const responseRequest = await this.service.deleteDecoder(decoderId);
    if (!responseRequest.ok) {
      errorNotificationToast(this.notifications, 'delete', 'decoder', responseRequest.error);
      return undefined;
    }
    return responseRequest.response;
  }

  public async getDraftIntegrations(): Promise<any[]> {
    const responseRequest = await this.service.getDraftIntegrations();
    if (!responseRequest.ok) {
      errorNotificationToast(
        this.notifications,
        'retrieve',
        'draft integrations',
        responseRequest.error
      );
      return [];
    }
    return responseRequest.response?.items || [];
  }
}
