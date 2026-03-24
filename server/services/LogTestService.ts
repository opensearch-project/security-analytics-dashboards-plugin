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
import { LogTestApiRequest, LogTestResponse } from '../../types';
import { CLIENT_LOG_TEST_METHODS } from '../utils/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';


function formatLogTestServiceError(error: any): string {
  const body = error?.body;
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim();
    }
    const nested = body.error;
    if (typeof nested === 'string' && nested.trim()) {
      return nested.trim();
    }
    if (nested && typeof nested === 'object') {
      if (typeof nested.reason === 'string' && nested.reason.trim()) {
        return nested.reason.trim();
      }
      const root = nested.root_cause;
      if (Array.isArray(root)) {
        const first = root.find((c: any) => typeof c?.reason === 'string' && c.reason.trim());
        if (first?.reason) {
          return String(first.reason).trim();
        }
      }
    }
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }
  return 'Log test failed due to an unexpected error.';
}

export class LogTestService extends MDSEnabledClientService {
  logTest = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, LogTestApiRequest>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<LogTestResponse> | ResponseError>> => {
    try {
      const { document: rawDocument } = request.body as LogTestApiRequest;
      const rawMeta = rawDocument.metadata;
      const hasMetadata =
        rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta) && Object.keys(rawMeta).length > 0;

      const logTest = {
        ...rawDocument,
        location: rawDocument.location?.trim() || '-',
        metadata: hasMetadata ? rawMeta : {},
      };

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

      if (!logTest.event) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'Event is required.',
          },
        });
      }

      if (!logTest.space) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: 'Space is required.',
          },
        });
      }

      const logTestResponse: LogTestResponse = await client(CLIENT_LOG_TEST_METHODS.TEST_LOG, {
        body: logTest,
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: logTestResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - LogTestService - logTest:', error);
      const extracted = formatLogTestServiceError(error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: extracted,
        },
      });
    }
  };
}
