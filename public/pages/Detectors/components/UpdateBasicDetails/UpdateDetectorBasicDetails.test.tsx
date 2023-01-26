/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../models/Detectors/components/UpdateDetectorBasicDetails/UpdateDetectorBasicDetails.mock';
import { expect } from '@jest/globals';
import { UpdateDetectorBasicDetails } from './UpdateBasicDetails';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

describe('<UpdateDetectorBasicDetails /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      wrapper = await mount(<UpdateDetectorBasicDetails {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
