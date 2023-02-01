/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/EditFieldMappings/EditFieldMappings.mock';
import { expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import EditFieldMappings from './EditFieldMapping';

describe('<EditFieldMappings /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      wrapper = await mount(<EditFieldMappings {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
