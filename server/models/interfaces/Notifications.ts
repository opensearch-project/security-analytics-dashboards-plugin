/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GetChannelsResponse {
  start_index: number;
  total_hits: number;
  total_hit_relation: string;
  channel_list: FeatureChannelList[];
}

export interface FeatureChannelList {
  config_id: string;
  name: string;
  description: string;
  config_type: string;
  is_enabled: boolean;
}

export interface GetNotificationConfigsResponse {
  start_index: number;
  total_hits: number;
  total_hit_relation: string;
  config_list: NotificationConfig[];
}

export interface NotificationConfig {
  config_id: string;
  last_updated_time_ms: number;
  created_time_ms: number;
  config: {
    name: string;
    description: string;
    config_type: string;
    is_enabled: boolean;
  };
}
