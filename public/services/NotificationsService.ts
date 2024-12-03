/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { GetChannelsResponse, GetNotificationConfigsResponse } from '../../types';
import { dataSourceInfo } from './utils/constants';

export class NotificationsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getChannel = async (
    channelId: string
  ): Promise<ServerResponse<GetNotificationConfigsResponse>> => {
    const url = `..${API.CHANNELS}/${channelId}`;
    const response = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetNotificationConfigsResponse>;
    return response;
  };

  getChannels = async (): Promise<ServerResponse<GetChannelsResponse>> => {
    const url = `..${API.CHANNELS}`;
    const response = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<GetChannelsResponse>;
    return response;
  };

  getServerFeatures = async (): Promise<ServerResponse<string[]>> => {
    const url = `..${API.NOTIFICATION_FEATURES}`;
    const response = (await this.httpClient.get(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<string[]>;
    return response;
  };
}
