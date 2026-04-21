/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { API } from '../../server/utils/constants';
import { ServerResponse } from '../../server/models/types';
import { CUDDecoderResponse, GetDecoderResponse, SearchDecodersResponse } from '../../types';
import { parse as LosslessParse, stringify as LosslessStringify } from 'lossless-json';

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

  private parseHttpError(error: any): string {
    return error?.body?.message || error?.body?.error || error?.message || 'Unknown error';
  }

  searchDecoders = async (
    body: any,
    space?: string
  ): Promise<ServerResponse<SearchDecodersResponse>> => {
    try {
      const url = `${this.baseUrl}/_search`;
      const normalizedSpace = this.normalizeSpace(space);
      const query = normalizedSpace ? { space: normalizedSpace } : {};
      return await this.httpClient.post(url, {
        query,
        body: JSON.stringify(body),
      });
    } catch (error: any) {
      return { ok: false, error: this.parseHttpError(error) };
    }
  };

getDecoder = async (
  decoderId: string,
  space: string
): Promise<ServerResponse<GetDecoderResponse>> => {
  try {
    const url = `${this.baseUrl}/${decoderId}`;
    const normalizedSpace = this.normalizeSpace(space);
    const query = normalizedSpace ? `?space=${normalizedSpace}` : '';
    const response = await fetch(`${url}${query}`, {
      headers: {
        'osd-xsrf': 'true',
      },
    });
    const text = await response.text();
    return LosslessParse(text) as ServerResponse<GetDecoderResponse>;
  } catch (error: any) {
    return { ok: false, error: this.parseHttpError(error) };
  }
};

  createDecoder = async (body: {
    document: any;
    integrationId: string;
  }): Promise<ServerResponse<CUDDecoderResponse>> => {
    try {
      const url = `${this.baseUrl}`;
      return await this.httpClient.post(url, {
        body: JSON.stringify({
          documentJson: LosslessStringify(body.document),
          integrationId: body.integrationId,
        }),
      });
    } catch (error: any) {
      return { ok: false, error: this.parseHttpError(error) };
    }
  };

  updateDecoder = async (
    decoderId: string,
    body: { document: any }
  ): Promise<ServerResponse<CUDDecoderResponse>> => {
    try {
      const url = `${this.baseUrl}/${decoderId}`;
      return await this.httpClient.put(url, {
        body: JSON.stringify({
          documentJson: LosslessStringify(body.document),
        }),
      });
    } catch (error: any) {
      return { ok: false, error: this.parseHttpError(error) };
    }
  };

  deleteDecoder = async (decoderId: string): Promise<ServerResponse<CUDDecoderResponse>> => {
    try {
      const url = `${this.baseUrl}/${decoderId}`;
      return await this.httpClient.delete(url, {});
    } catch (error: any) {
      return { ok: false, error: this.parseHttpError(error) };
    }
  };

  getDraftIntegrations = async (): Promise<ServerResponse<any>> => {
    try {
      const url = `${this.baseUrl}/integrations/draft`;
      return await this.httpClient.get(url, {});
    } catch (error: any) {
      return { ok: false, error: this.parseHttpError(error) };
    }
  };
}
