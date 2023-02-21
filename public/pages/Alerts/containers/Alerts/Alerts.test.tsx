/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Alerts from './Alerts';
import contextMock from '../../../../../test/mocks/useContext.mock';
import { mount } from 'enzyme';
import alertsMock from '../../../../../test/mocks/Alerts/Alerts.mock';
import { shallowToJson } from 'enzyme-to-json';
import { Router } from 'react-router-dom';
import browserHistoryMock from '../../../../../test/mocks/services/browserHistory.mock';

describe('<Alerts /> spec', () => {
  it('renders the component', () => {
    Alerts.WrappedComponent.contextType = contextMock;
    const wrapper = mount(
      <Router history={browserHistoryMock}>
        <Alerts {...alertsMock} />
      </Router>,
      {
        context: contextMock,
      }
    );
    expect(shallowToJson(wrapper.root().children())).toMatchSnapshot();
  });
});
