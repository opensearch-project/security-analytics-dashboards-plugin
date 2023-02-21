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
jest.mock(
  '../../../CreateDetector/components/DefineDetector/components/DetectorDataSource/DetectorDataSource.tsx',
  () => () => {
    return <mock-component mock="DetectorDataSource" />;
  }
);
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
