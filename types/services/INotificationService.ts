/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetChannelsResponse, GetNotificationConfigsResponse } from '../Notification';
import { ServerResponse } from './ServerResponse';

export interface INotificationService {
  getChannel(channelId: string): Promise<ServerResponse<GetNotificationConfigsResponse>>;
  getChannels(): Promise<ServerResponse<GetChannelsResponse>>;
}
