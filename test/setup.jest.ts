/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import 'jest-canvas-mock';
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { mockDetectorHit } from '../public/models/Interfaces.mock';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

configure({ testIdAttribute: 'data-test-subj' });

jest.mock('@elastic/eui/lib/eui_components/form/form_row/make_id', () => () => 'some_make_id');

jest.mock('@elastic/eui/lib/services/accessibility/html_id_generator', () => ({
  htmlIdGenerator: () => {
    return () => 'some_html_id';
  },
}));

// @ts-ignore
window.Worker = function () {
  this.postMessage = () => {};
  // @ts-ignore
  this.terminate = () => {};
};

// @ts-ignore
window.URL = {
  createObjectURL: () => {
    return '';
  },
};

// https://github.com/elastic/eui/issues/2530
jest.mock('@elastic/eui/lib/eui_components/icon', () => ({
  EuiIcon: () => 'EuiIconMock',
  __esModule: true,
  IconPropType: require('@elastic/eui/lib/eui_components/icon/icon').IconPropType,
  ICON_TYPES: require('@elastic/eui/lib/eui_components/icon/icon').TYPES,
  ICON_SIZES: require('@elastic/eui/lib/eui_components/icon/icon').SIZES,
  ICON_COLORS: require('@elastic/eui/lib/eui_components/icon/icon').COLORS,
}));

jest.mock('moment', () => {
  const moment = jest.requireActual('moment');

  // Set moment tz mock
  if (!moment.tz) moment.tz = {};
  moment.tz.names = () => ['Pacific/Tahiti'];
  const momentInstance = moment();

  momentInstance.format = jest.fn().mockReturnValue('2023-01-25T10:05');

  function fakeMoment() {
    return momentInstance;
  }

  Object.assign(fakeMoment, moment);

  return fakeMoment;
});

const mockUseContext = {
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
            hits: [mockDetectorHit],
          },
        },
      };
    },
  },
  ruleService: {
    fetchRules: () => {
      return Promise.resolve([mockDetectorHit]);
    },
    getRules: () => {
      return {
        ok: true,
        response: {
          hits: {
            hits: [mockDetectorHit],
          },
        },
      };
    },
  },
};

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useContext: () => mockUseContext,
  };
});

jest.mock('../public/pages/CreateDetector/components/ConfigureAlerts/utils/constants.ts', () => ({
  ...jest.requireActual(
    '../public/pages/CreateDetector/components/ConfigureAlerts/utils/constants.ts'
  ),
  ALERT_SEVERITY_OPTIONS: {
    HIGHEST: { id: '1', value: '1', label: '1 (Highest)', text: '1 (Highest)' },
    HIGH: { id: '2', value: '2', label: '2 (High)', text: '2 (High)' },
    MEDIUM: { id: '3', value: '3', label: '3 (Medium)', text: '3 (Medium)' },
    LOW: { id: '4', value: '4', label: '4 (Low)', text: '4 (Low)' },
    LOWEST: { id: '5', value: '5', label: '5 (Lowest)', text: '5 (Lowest)' },
  },
}));

jest.setTimeout(10000); // in milliseconds
