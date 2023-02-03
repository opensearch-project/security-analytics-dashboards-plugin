/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/DetectorDetails/DetectorDetails.mock';
import { expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { DetectorDetails } from './DetectorDetails';
import contextMock from '../../../../../test/mocks/useContext.mock';

describe('<DetectorDetails /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      DetectorDetails.contextType = contextMock;
      wrapper = await mount(<DetectorDetails {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
