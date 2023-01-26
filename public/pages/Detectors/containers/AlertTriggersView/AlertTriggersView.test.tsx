/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../models/Detectors/containers/AlertTriggersView/AlertTriggersView.mock';
import { expect } from '@jest/globals';
import { AlertTriggersView } from './AlertTriggersView';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

describe('<AlertTriggersView /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      wrapper = await mount(<AlertTriggersView {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
