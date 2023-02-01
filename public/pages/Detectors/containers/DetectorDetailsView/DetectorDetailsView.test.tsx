/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/DetectorDetailsView/DetectorDetailsView.mock';
import { expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { DetectorDetailsView } from './DetectorDetailsView';

describe('<DetectorDetailsView /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      wrapper = await mount(<DetectorDetailsView {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
