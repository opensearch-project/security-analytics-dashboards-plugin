/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { METHOD_NAMES, CONTENT_MANAGER_BASE_PATH } from '../utils/constants';

export function addLogTestMethods(securityAnalytics: any, createAction: any): void {
    securityAnalytics[METHOD_NAMES.TEST_LOG] = createAction({
        url: {
            fmt: `${CONTENT_MANAGER_BASE_PATH}/logtest`,
        },
        needBody: true,
        method: 'POST',
    });
}
