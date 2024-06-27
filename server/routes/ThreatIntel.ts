/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'src/core/server';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { schema } from '@osd/config-schema';
import { createQueryValidationSchema } from '../utils/helpers';

export function setupThreatIntelRoutes({ threatIntelService }: NodeServices, router: IRouter) {
  router.post(
    {
      path: `${API.THREAT_INTEL_BASE}/sources`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    threatIntelService.addThreatIntelSource
  );

  router.put(
    {
      path: `${API.THREAT_INTEL_BASE}/sources/{sourceId}`,
      validate: {
        params: schema.object({
          sourceId: schema.string(),
        }),
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    threatIntelService.updateThreatIntelSource
  );

  router.post(
    {
      path: `${API.THREAT_INTEL_BASE}/sources/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    threatIntelService.searchThreatIntelSources
  );

  router.get(
    {
      path: `${API.THREAT_INTEL_BASE}/sources/{sourceId}`,
      validate: {
        params: schema.object({
          sourceId: schema.string(),
        }),
        query: createQueryValidationSchema(),
      },
    },
    threatIntelService.getThreatIntelSource
  );

  router.post(
    {
      path: `${API.THREAT_INTEL_BASE}/monitors`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    threatIntelService.createThreatIntelMonitor
  );

  router.post(
    {
      path: `${API.THREAT_INTEL_BASE}/monitors/_search`,
      validate: {
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    threatIntelService.searchThreatIntelMonitors
  );

  router.get(
    {
      path: `${API.THREAT_INTEL_BASE}/iocs`,
      validate: {
        query: createQueryValidationSchema({
          startIndex: schema.maybe(schema.number()),
          size: schema.maybe(schema.number()),
          feedIds: schema.maybe(schema.string()),
          iocTypes: schema.maybe(schema.string()),
          search: schema.maybe(schema.string()),
          sortString: schema.maybe(schema.string()),
        }),
      },
    },
    threatIntelService.getThreatIntelIocs
  );
}
