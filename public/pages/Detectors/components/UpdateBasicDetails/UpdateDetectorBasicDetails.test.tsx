/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/components/UpdateDetectorBasicDetails/UpdateDetectorBasicDetails.mock';
import { expect } from '@jest/globals';
import { UpdateDetectorBasicDetails } from './UpdateBasicDetails';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { coreContextMock, mockContexts } from '../../../../../test/mocks/useContext.mock';

describe('<UpdateDetectorBasicDetails /> spec', () => {
  it('renders the component', async () => {
    let wrapper: any;
    await act(async () => {
      jest
        .spyOn(React, 'useContext')
        .mockImplementation(() => ({ ...mockContexts, ...coreContextMock }));
      wrapper = mount(<UpdateDetectorBasicDetails {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
