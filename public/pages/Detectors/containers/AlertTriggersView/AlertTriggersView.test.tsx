/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { alertTriggerViewProps } from '../../../../../test/mocks/Detectors/containers/AlertTriggersView/AlertTriggersView.mock';
import { expect } from '@jest/globals';
import { AlertTriggersView } from './AlertTriggersView';
import { ReactWrapper, mount } from 'enzyme';
import { mockContexts } from '../../../../../test/mocks/useContext.mock';
import { act } from 'react-dom/test-utils';

describe('<AlertTriggersView /> spec', () => {
  it('renders the component', async () => {
    let wrapper: ReactWrapper;
    jest.spyOn(React, 'useContext').mockImplementation(() => mockContexts);
    await act(async () => {
      wrapper = mount(<AlertTriggersView {...alertTriggerViewProps} />);
    });
    expect(wrapper!).toMatchSnapshot();
  });
});
