/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/components/DetectorRulesView/DetectorRulesView.mock';
import { expect } from '@jest/globals';
import { DetectorRulesView } from './DetectorRulesView';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

describe('<DetectorRulesView /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      wrapper = await mount(<DetectorRulesView {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
