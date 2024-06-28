/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES, API } from '../utils/constants';

export function addFindingsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.GET_FINDINGS] = createAction({
    url: {
      fmt: `${API.GET_FINDINGS}`,
      params: {
        detector_id: {
          type: 'string',
        },
        sortOrder: {
          type: 'string',
        },
        size: {
          type: 'number',
        },
        detectorType: {
          type: 'string',
        },
        startIndex: {
          type: 'number',
        },
        detectionType: {
          type: 'string',
        },
        severity: {
          type: 'string',
        },
        searchString: {
          type: 'string',
        },
        findingIds: {
          type: 'string',
        },
      },
    },
    needBody: false,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.GET_THREAT_INTEL_FINDINGS] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/findings/_search`,
      params: {
        sortOrder: {
          type: 'string',
        },
        size: {
          type: 'number',
        },
        startIndex: {
          type: 'number',
        },
        searchString: {
          type: 'string',
        },
        findingIds: {
          type: 'list',
        },
        iocIds: {
          type: 'string',
        },
        startTime: {
          type: 'number',
        },
        endTime: {
          type: 'number',
        },
      },
    },
    needBody: false,
    method: 'GET',
  });
}
