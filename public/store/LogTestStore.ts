/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import LogTestService from '../services/LogTestService';
import { LogTestApiRequest, LogTestResponse } from '../../types';

function formatLogTestClientError(error: unknown): string {
  const err = error as any;
  const body = err?.body;
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim();
    }
    const nested = (body as any).error;
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
  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }
  return 'An unexpected error occurred while running the log test.';
}

export interface LogTestStoreResult {
    success: boolean;
    data?: LogTestResponse;
    error?: string;
}

export class LogTestStore {
    constructor(
        private service: LogTestService,
        private notifications: NotificationsStart
    ) {}

    executeLogTest = async (request: LogTestApiRequest): Promise<LogTestStoreResult> => {
        try {
            const response = await this.service.executeLogTest(request);

            if (!response.ok) {
                errorNotificationToast(
                    this.notifications,
                    'execute',
                    'log test',
                    response.error
                );
                return {
                    success: false,
                    error: response.error,
                };
            }

            return {
                success: true,
                data: response.response,
            };
        } catch (error: unknown) {
            const errorMessage = formatLogTestClientError(error);
            errorNotificationToast(this.notifications, 'submit', 'Log test', errorMessage);
            return {
                success: false,
                error: errorMessage,
            };
        }
    };
}