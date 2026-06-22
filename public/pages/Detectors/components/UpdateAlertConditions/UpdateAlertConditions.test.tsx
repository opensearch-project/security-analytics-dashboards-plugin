/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/components/UpdateAlertConditions/UpdateAlertConditions.mock';
import { expect } from '@jest/globals';
import UpdateAlertConditions from './UpdateAlertConditions';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { coreContextMock } from '../../../../../test/mocks/useContext.mock';

jest.mock(
  '../../../CreateDetector/components/ConfigureAlerts/containers/ConfigureAlerts.tsx',
  () => () => {
    return <mock-component mock="ConfigureAlerts" />;
  }
);

describe('<UpdateAlertConditions /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      UpdateAlertConditions.contextType = React.createContext(coreContextMock);
      wrapper = await mount(<UpdateAlertConditions {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
