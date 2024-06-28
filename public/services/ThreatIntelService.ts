/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  AddThreatIntelSourcePayload,
  GetIocsQueryParams,
  ThreatIntelMonitorPayload,
} from '../../types';
import { dataSourceInfo } from './utils/constants';
import { API } from '../../server/utils/constants';

export default class ThreatIntelService {
  constructor(private httpClient: HttpSetup) {}

  addThreatIntelSource = async (
    source: AddThreatIntelSourcePayload
  ): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(source),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  updateThreatIntelSource = async (
    id: string,
    source: AddThreatIntelSourcePayload
  ): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${id}`;
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(source),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  searchThreatIntelSource = async (): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/_search`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify({ query: { match_all: {} } }),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  getThreatIntelSource = async (sourceId: string): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${sourceId}`;
    const response = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  deleteThreatIntelSource = async (sourceId: string): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${sourceId}`;
    const response = (await this.httpClient.delete(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  refreshThreatIntelSource = async (sourceId: string): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${sourceId}/_refresh`;
    const response = (await this.httpClient.post(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  createThreatIntelMonitor = async (montiorPayload: ThreatIntelMonitorPayload) => {
    const url = `..${API.THREAT_INTEL_BASE}/monitors`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(montiorPayload),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  updateThreatIntelMonitor = async (id: string, montiorPayload: ThreatIntelMonitorPayload) => {
    const url = `..${API.THREAT_INTEL_BASE}/monitors/${id}`;
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(montiorPayload),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    return response;
  };

  getThreatIntelScanConfig = async () => {
    const url = `..${API.THREAT_INTEL_BASE}/monitors/_search`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify({ query: { match_all: {} } }),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    if (response.ok) {
      const { _source } = response.response.hits.hits[0];

      return {
        ok: response.ok,
        response: { ..._source },
      };
    }

    return response;
  };

  getThreatIntelIocs = async (getIocsQueryParams: GetIocsQueryParams) => {
    const url = `..${API.THREAT_INTEL_BASE}/iocs`;
    const response = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
        ...getIocsQueryParams,
      },
    })) as ServerResponse<any>;

    return response;
  };
}
