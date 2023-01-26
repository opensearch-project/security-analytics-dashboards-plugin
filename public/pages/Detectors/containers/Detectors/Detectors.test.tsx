/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../models/Detectors/containers/Detectors/Detectors.mock';
import { expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import Detectors from './Detectors';

describe('<Detectors /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    const context = {
      chrome: {
        setBreadcrumbs: jest.fn(),
      },
    };
    await act(async () => {
      Detectors.contextType = React.createContext(context);
      wrapper = await mount(<Detectors {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
