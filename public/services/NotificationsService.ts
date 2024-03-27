/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse } from '../../server/models/types';
import { API } from '../../server/utils/constants';
import { GetChannelsResponse, GetNotificationConfigsResponse } from '../../types';

export default class NotificationsService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getChannel = async (
    channelId: string
  ): Promise<ServerResponse<GetNotificationConfigsResponse>> => {
    let url = `..${API.CHANNELS}/${channelId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<
      GetNotificationConfigsResponse
    >;
    return response;
  };

  getChannels = async (): Promise<ServerResponse<GetChannelsResponse>> => {
    let url = `..${API.CHANNELS}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetChannelsResponse>;
    return response;
  };

  getServerFeatures = async (): Promise<ServerResponse<Array<string>>> => {
    let url = `..${API.NOTIFICATION_FEATURES}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<Array<string>>;
    return response;
  };
}
