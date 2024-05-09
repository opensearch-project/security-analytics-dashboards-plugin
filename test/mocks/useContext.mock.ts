/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorHitMock from './Detectors/containers/Detectors/DetectorHit.mock';

const coreContextMock = {
  chrome: {
    setBreadcrumbs: jest.fn(),
  },
};

const mockContexts = {
  services: {
    notificationsService: {
      getChannels: () => {
        return Promise.resolve({
          ok: true,
          response: {
            channel_list: [],
          },
        });
      },
    },
    indexService: {
      getIndices: () => {
        return {
          ok: true,
          response: {
            indices: [],
          },
        };
      },
      getAliases: () => {
        return {
          ok: true,
          response: {
            aliases: [],
          },
        };
      },
    },
    detectorsService: {
      getDetectors: () => {
        return {
          ok: true,
          response: {
            hits: {
              hits: [detectorHitMock],
            },
          },
        };
      },
    },
    ruleService: {
      fetchRules: () => {
        return Promise.resolve([detectorHitMock]);
      },
      getRules: () => {
        return {
          ok: true,
          response: {
            hits: {
              hits: [detectorHitMock],
            },
          },
        };
      },
    },
  },
  metrics: {
    detectorMetricsManager: {
      sendMetrics: jest.fn(),
      resetMetrics: jest.fn(),
    },
  },
  dataSource: {
    id: '',
  },
  setDataSource: jest.fn(),
  setDataSourceMenuReadOnly: jest.fn(),
};

export { mockContexts, coreContextMock };
