/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import 'jest-canvas-mock';
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import Enzyme from 'enzyme';
// @ts-ignore
import Adapter from 'enzyme-adapter-react-16';
import { mockContexts } from './mocks/useContext.mock';
import { DataStore } from '../public/store/DataStore';
import services from './mocks/services';
import notificationsStartMock from './mocks/services/notifications/NotificationsStart.mock';
import replaceAllInserter from 'string.prototype.replaceall';
replaceAllInserter.shim();

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

/**
 * Moment timezones are not working from jest so here we mock
 * moment.tz.names function
 *
 * Also, format function is mocked to return always the same value so that we can correctly test
 * functions that call this
 */
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

/**
 * React useContext is mocked to return the mocked services
 * so that this works in all tests
 */
jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useContext: () => mockContexts,
  };
});

/**
 * Mocks the vega view renderer
 */
jest.mock('vega/build-es5/vega.js', () => {
  const vega = jest.requireActual('vega/build-es5/vega.js');
  return {
    ...vega,
    View: jest.fn().mockReturnValue({
      tooltip: jest.fn(),
      runAsync: jest.fn().mockReturnValue(new Promise(jest.fn())),
    }),
  };
});

DataStore.init(services, notificationsStartMock);

jest.setTimeout(10000); // in milliseconds
