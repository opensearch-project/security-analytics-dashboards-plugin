/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../models/Detectors/containers/DetectorDetails/DetectorDetails.mock';
import { expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { DetectorDetails } from './DetectorDetails';

describe('<DetectorDetails /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    const context = {
      chrome: {
        setBreadcrumbs: jest.fn(),
      },
    };
    await act(async () => {
      DetectorDetails.contextType = React.createContext(context);
      wrapper = await mount(<DetectorDetails {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
