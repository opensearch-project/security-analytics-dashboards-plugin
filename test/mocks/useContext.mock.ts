/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import detectorHitMock from './Detectors/containers/Detectors/DetectorHit.mock';

const context = {
  chrome: {
    setBreadcrumbs: jest.fn(),
  },
};

const contextServicesMock = {
  notificationsService: {
    getChannels: () => {
      return {
        ok: true,
        response: {
          channel_list: [],
        },
      };
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
};

export default React.createContext(context);

export { contextServicesMock };
