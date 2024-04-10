/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
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

export default class NotificationsService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend GET channels API from the Notifications plugin
   * to retrieve the channel config with the specific ID.
   */
  getChannel = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetNotificationConfigsResponse> | ResponseError>
  > => {
    try {
      const { id } = request.params as {
        id: string;
      };

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getResponse: GetNotificationConfigsResponse = await callWithRequest(
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
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetChannelsResponse> | ResponseError>
  > => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getChannelsResponse: GetChannelsResponse = await callWithRequest(
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
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<Array<string>> | ResponseError>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getFeaturesResponse: GetFeaturesResponse = await callWithRequest(
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
