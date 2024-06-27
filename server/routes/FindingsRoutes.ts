/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupFindingsRoutes(services: NodeServices, router: IRouter) {
  const { findingsService } = services;

  router.get(
    {
      path: `${API.GET_FINDINGS}`,
      validate: {
        query: createQueryValidationSchema({
          detectorType: schema.maybe(schema.string()),
          detector_id: schema.maybe(schema.string()),
          sortOrder: schema.maybe(schema.string()),
          size: schema.maybe(schema.number()),
          startIndex: schema.maybe(schema.number()),
          detectionType: schema.maybe(schema.string()),
          severity: schema.maybe(schema.string()),
          searchString: schema.maybe(schema.string()),
          findingIds: schema.maybe(schema.string()),
          startTime: schema.maybe(schema.number()),
          endTime: schema.maybe(schema.number()),
        }),
      },
    },
    findingsService.getFindings
  );

  router.get(
    {
      path: `${API.THREAT_INTEL_BASE}/findings/_search`,
      validate: {
        query: createQueryValidationSchema({
          sortOrder: schema.maybe(schema.string()),
          size: schema.maybe(schema.number()),
          startIndex: schema.maybe(schema.number()),
          searchString: schema.maybe(schema.string()),
          findingIds: schema.maybe(schema.string()),
          startTime: schema.maybe(schema.number()),
          endTime: schema.maybe(schema.number()),
          iocIds: schema.maybe(schema.string()),
        }),
      },
    },
    findingsService.getThreatIntelFindings
  );
}
