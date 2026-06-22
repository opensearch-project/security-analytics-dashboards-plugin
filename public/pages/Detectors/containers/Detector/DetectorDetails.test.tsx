/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/DetectorDetails/DetectorDetails.mock';
import { expect } from '@jest/globals';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { DetectorDetails } from './DetectorDetails';
import { coreContextMock } from '../../../../../test/mocks/useContext.mock';
import { setupCoreStart } from '../../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<DetectorDetails /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      DetectorDetails.contextType = React.createContext(coreContextMock);
      wrapper = await mount(<DetectorDetails {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
