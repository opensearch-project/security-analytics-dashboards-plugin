/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupLogTestRoutes(services: NodeServices, router: IRouter) {
    const { logTestService } = services;

    router.post(
        {
            path: API.LOG_TEST_BASE,
            validate: {
                body: schema.object({
                    document: schema.object({
                        queue: schema.number(),
                        location: schema.string(),
                        agent_metadata: schema.maybe(
                            schema.recordOf(schema.string(), schema.any())
                        ),
                        event: schema.string(),
                        trace_level: schema.maybe(
                            schema.oneOf([
                                schema.literal('NONE'),
                                schema.literal('ASSET_ONLY'),
                                schema.literal('ALL'),
                            ])
                        ),
                    }),
                    integrationId: schema.string(),
                }),
                query: createQueryValidationSchema(),
            },
        },
        logTestService.logTest
    );
}