/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import {
  CreateKVDBPayload,
  CUDKVDBResponse,
  KVDBIntegrationsSearchResponse,
  KVDBSearchRequest,
  KVDBSearchResponse,
  ServerResponse,
  UpdateKVDBPayload,
} from '../../types';
import { API } from '../../server/utils/constants';

export default class KVDBsService {
  private readonly baseUrl: string = `..${API.KVDBS_BASE}`;

  constructor(private httpClient: HttpSetup) {}

  searchKVDBs = async (params: KVDBSearchRequest): Promise<ServerResponse<KVDBSearchResponse>> => {
    const url = `${this.baseUrl}/_search`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify(params ?? {}),
    })) as ServerResponse<KVDBSearchResponse>;
  };

  searchIntegrations = async (
    kvdbIds: string[]
  ): Promise<ServerResponse<KVDBIntegrationsSearchResponse>> => {
    const url = `${this.baseUrl}/_integrations`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify({ kvdbIds }),
    })) as ServerResponse<KVDBIntegrationsSearchResponse>;
  };

  createKVDB = async (body: CreateKVDBPayload): Promise<ServerResponse<CUDKVDBResponse>> => {
    const url = `${this.baseUrl}`;
    return await this.httpClient.post(url, {
      body: JSON.stringify(body),
    });
  };

  updateKVDB = async (
    kvdbId: string,
    body: UpdateKVDBPayload
  ): Promise<ServerResponse<CUDKVDBResponse>> => {
    const url = `${this.baseUrl}/${kvdbId}`;
    return await this.httpClient.put(url, {
      body: JSON.stringify(body),
    });
  };

  deleteKVDB = async (kvdbId: string): Promise<ServerResponse<CUDKVDBResponse>> => {
    const url = `${this.baseUrl}/${kvdbId}`;
    return await this.httpClient.delete(url, {});
  };
}
