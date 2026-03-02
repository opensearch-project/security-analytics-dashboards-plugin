/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import LogTestService from '../services/LogTestService';
import { LogTestApiRequest, LogTestResponse } from '../../types';

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
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error occurred';
            errorNotificationToast(
                this.notifications,
                'execute',
                'log test',
                errorMessage
            );
            return {
                success: false,
                error: errorMessage,
            };
        }
    };
}