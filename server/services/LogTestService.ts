/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
    IOpenSearchDashboardsResponse,
    OpenSearchDashboardsRequest,
    OpenSearchDashboardsResponseFactory,
    RequestHandlerContext,
    ResponseError,
} from 'opensearch-dashboards/server';
import { ServerResponse } from '../models/types';
import {
    LogTestApiRequest,
    LogTestRequestBody,
    LogTestResponse,
} from '../../types';
import { CLIENT_LOG_TEST_METHODS } from '../utils/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';

export class LogTestService extends MDSEnabledClientService {
    logTest = async (
        context: RequestHandlerContext,
        request: OpenSearchDashboardsRequest<unknown, unknown, LogTestApiRequest>,
        response: OpenSearchDashboardsResponseFactory
    ): Promise<
        IOpenSearchDashboardsResponse<ServerResponse<LogTestResponse> | ResponseError>
    > => {
        try {
            const logTest = request.body.document as LogTestRequestBody;
            const client = this.getClient(request, context);

            if (logTest.queue === undefined || logTest.queue === null) {
                return response.custom({
                    statusCode: 200,
                    body: {
                        ok: false,
                        error: 'Queue is required.',
                    },
                });
            }

            if (!logTest.location) {
                return response.custom({
                    statusCode: 200,
                    body: {
                        ok: false,
                        error: 'Location is required.',
                    },
                });
            }

            if (!logTest.event) {
                return response.custom({
                    statusCode: 200,
                    body: {
                        ok: false,
                        error: 'Event is required.',
                    },
                });
            }

            const logTestResponse: LogTestResponse = await client(
                CLIENT_LOG_TEST_METHODS.TEST_LOG,
                { body: logTest }
            );

            return response.custom({
                statusCode: 200,
                body: {
                    ok: true,
                    response: logTestResponse,
                },
            });
        } catch (error: any) {
            console.error('Security Analytics - LogTestService - logTest:', error);
            return response.custom({
                statusCode: 200,
                body: {
                    ok: false,
                    error: error.message,
                },
            });
        }
    };
}