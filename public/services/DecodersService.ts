/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { API } from '../../server/utils/constants';
import { ServerResponse } from '../../server/models/types';
import { CUDDecoderResponse, GetDecoderResponse, SearchDecodersResponse } from '../../types';

export default class DecodersService {
  private readonly httpClient: HttpSetup;
  private readonly baseUrl: string = `..${API.DECODERS_BASE}`;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  public normalizeSpace(space?: unknown): string | undefined {
    if (!space) {
      return undefined;
    }
    if (typeof space === 'string') {
      return space;
    }
    if (typeof space === 'object') {
      const record = space as Record<string, unknown>;
      if (typeof record.name === 'string') {
        return record.name;
      }
      if (typeof record.id === 'string') {
        return record.id;
      }
      if (typeof record.value === 'string') {
        return record.value;
      }
    }
    return undefined;
  }

  searchDecoders = async (
    body: any,
    space?: string
  ): Promise<ServerResponse<SearchDecodersResponse>> => {
    const url = `${this.baseUrl}/_search`;
    const normalizedSpace = this.normalizeSpace(space);
    const query = normalizedSpace ? { space: normalizedSpace } : {};
    return await this.httpClient.post(url, {
      query,
      body: JSON.stringify(body),
    });
  };

  getDecoder = async (decoderId: string): Promise<ServerResponse<GetDecoderResponse>> => {
    const url = `${this.baseUrl}/${decoderId}`;
    return (await this.httpClient.get(url, {})) as ServerResponse<GetDecoderResponse>;
  };

  createDecoder = async (body: {
    document: any;
    integrationId: string;
  }): Promise<ServerResponse<CUDDecoderResponse>> => {
    const url = `${this.baseUrl}`;
    return await this.httpClient.post(url, {
      body: JSON.stringify(body),
    });
  };

  updateDecoder = async (
    decoderId: string,
    body: { document: any }
  ): Promise<ServerResponse<CUDDecoderResponse>> => {
    const url = `${this.baseUrl}/${decoderId}`;
    return await this.httpClient.put(url, {
      body: JSON.stringify(body),
    });
  };

  deleteDecoder = async (decoderId: string): Promise<ServerResponse<CUDDecoderResponse>> => {
    const url = `${this.baseUrl}/${decoderId}`;
    return await this.httpClient.delete(url, {});
  };

  getDraftIntegrations = async (): Promise<ServerResponse<any>> => {
    const url = `${this.baseUrl}/integrations/draft`;
    return await this.httpClient.get(url, {});
  };
}
