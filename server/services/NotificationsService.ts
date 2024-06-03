/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import { CLIENT_NOTIFICATIONS_METHODS } from '../utils/constants';
import {
  GetChannelsResponse,
  GetFeaturesResponse,
  GetNotificationConfigsResponse,
} from '../../types';
import { MDSEnabledClientService } from './MDSEnabledClientService';

export default class NotificationsService extends MDSEnabledClientService {
  /**
   * Calls backend GET channels API from the Notifications plugin
   * to retrieve the channel config with the specific ID.
   */
  getChannel = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetNotificationConfigsResponse> | ResponseError>
  > => {
    try {
      const { id } = request.params as {
        id: string;
      };

      const client = this.getClient(request, context);
      const getResponse: GetNotificationConfigsResponse = await client(
        CLIENT_NOTIFICATIONS_METHODS.GET_CHANNEL,
        { id }
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getResponse,
        },
      });
    } catch (err: any) {
      console.error('Security Analytics - NotificationsService - getChannel:', err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend GET channels API from the Notifications plugin.
   */
  getChannels = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetChannelsResponse> | ResponseError>
  > => {
    try {
      const client = this.getClient(request, context);
      const getChannelsResponse: GetChannelsResponse = await client(
        CLIENT_NOTIFICATIONS_METHODS.GET_CHANNELS
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getChannelsResponse,
        },
      });
    } catch (err: any) {
      console.error('Security Analytics - NotificationsService - getChannels:', err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  getNotificationsFeatures = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<Array<string>> | ResponseError>> => {
    try {
      const client = this.getClient(request, context);
      const getFeaturesResponse: GetFeaturesResponse = await client(
        CLIENT_NOTIFICATIONS_METHODS.GET_FEATURES
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getFeaturesResponse.allowed_config_type_list,
        },
      });
    } catch (err: any) {
      console.error('Security Analytics - NotificationsService - getFeatures:', err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}
