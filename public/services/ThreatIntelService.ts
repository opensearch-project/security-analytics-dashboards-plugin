/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup, NotificationsStart } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import {
  AddThreatIntelSourcePayload,
  GetIocsQueryParams,
  ThreatIntelMonitorPayload,
} from '../../types';
import { dataSourceInfo } from './utils/constants';
import { API } from '../../server/utils/constants';
import { errorNotificationToast } from '../utils/helpers';

export default class ThreatIntelService {
  constructor(private httpClient: HttpSetup, private notifications: NotificationsStart) {}

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

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'add', 'threat intel source', response.error);
    }

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

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'update', 'threat intel source', response.error);
    }

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

    if (
      !response.ok &&
      !response.error?.includes('Threat intel source config index does not exist')
    ) {
      errorNotificationToast(this.notifications, 'get', 'threat intel source(s)', response.error);
    }

    return response;
  };

  getThreatIntelSource = async (sourceId: string): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${sourceId}`;
    const response = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'get', 'threat intel source', response.error);
    }

    return response;
  };

  deleteThreatIntelSource = async (sourceId: string): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${sourceId}`;
    const response = (await this.httpClient.delete(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'delete', 'threat intel source', response.error);
    }

    return response;
  };

  refreshThreatIntelSource = async (sourceId: string): Promise<ServerResponse<any>> => {
    const url = `..${API.THREAT_INTEL_BASE}/sources/${sourceId}/_refresh`;
    const response = (await this.httpClient.post(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<any>;

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'refresh', 'threat intel source', response.error);
    }

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

    if (!response.ok) {
      errorNotificationToast(
        this.notifications,
        'setup',
        'threat intel scan monitor',
        response.error
      );
    }

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

    if (!response.ok) {
      errorNotificationToast(
        this.notifications,
        'update',
        'threat intel scan monitor',
        response.error
      );
    }

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
    } else if (
      !response.error.includes('Configured indices are not found: [.opendistro-alerting-config]')
    ) {
      errorNotificationToast(
        this.notifications,
        'get',
        'threat intel scan monitor',
        response.error
      );
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

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'get', 'indicators of compromise', response.error);
    }

    return response;
  };
}
