/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/Detectors/Detectors.mock';
import { expect } from '@jest/globals';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import Detectors from './Detectors';
import { coreContextMock } from '../../../../../test/mocks/useContext.mock';
import { setupCoreStart } from '../../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<Detectors /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      Detectors.contextType = React.createContext(coreContextMock);
      wrapper = await mount(<Detectors {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
