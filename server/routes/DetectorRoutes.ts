/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { API } from '../utils/constants';
import { NodeServices } from '../models/interfaces';

export function setupDetectorRoutes(services: NodeServices, router: IRouter) {
  const { detectorsService } = services;

  router.post(
    {
      path: API.DETECTORS_BASE,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    detectorsService.createDetector
  );

  router.get(
    {
      path: `${API.DETECTORS_BASE}/{detectorId}`,
      validate: {
        params: schema.object({
          detectorId: schema.string(),
        }),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    detectorsService.getDetector
  );

  router.post(
    {
      path: `${API.SEARCH_DETECTORS}`,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    detectorsService.searchDetectors
  );

  router.put(
    {
      path: `${API.DETECTORS_BASE}/{detectorId}`,
      validate: {
        params: schema.object({
          detectorId: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    detectorsService.updateDetector
  );

  router.delete(
    {
      path: `${API.DETECTORS_BASE}/{detectorId}`,
      validate: {
        params: schema.object({
          detectorId: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          dataSourceId: schema.maybe(schema.string()),
        }),
      },
    },
    detectorsService.deleteDetector
  );
}
