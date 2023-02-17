/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/AlertTriggersView/AlertTriggersView.mock';
import { expect } from '@jest/globals';
import { AlertTriggersView } from './AlertTriggersView';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import context, { servicesContextMock } from '../../../../../test/mocks/useContext.mock';

describe('<AlertTriggersView /> spec', () => {
  it('renders the component', async () => {
    let wrapper;

    await act(async () => {
      jest.spyOn(React, 'useContext').mockImplementation(() => servicesContextMock);
      wrapper = await mount(<AlertTriggersView {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
