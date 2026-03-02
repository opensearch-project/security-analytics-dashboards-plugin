/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { ServerResponse, LogTestApiRequest, LogTestResponse } from '../../types';
import { API } from '../../server/utils/constants';

export default class LogTestService {
    constructor(private httpClient: HttpSetup) {}

    executeLogTest = async (
        params: LogTestApiRequest
    ): Promise<ServerResponse<LogTestResponse>> => {
        const url = `${API.LOG_TEST_BASE}`;
        return (await this.httpClient.post(url, {
            body: JSON.stringify(params),
        })) as ServerResponse<LogTestResponse>;
    };
}
