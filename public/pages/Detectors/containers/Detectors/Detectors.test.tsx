/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/Detectors/Detectors.mock';
import { expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import Detectors from './Detectors';
import contextMock from '../../../../../test/mocks/useContext.mock';

describe('<Detectors /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      Detectors.contextType = contextMock;
      wrapper = await mount(<Detectors {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
