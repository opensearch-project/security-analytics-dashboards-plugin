/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Alerts from './Alerts';
import alertsMock from '../../../../../test/mocks/Alerts/Alerts.mock';
import { MemoryRouter } from 'react-router-dom';
import { setupCoreStart } from '../../../../../test/utils/helpers';
import { render } from '@testing-library/react';

beforeAll(() => {
  setupCoreStart();
});

describe('<Alerts /> spec', () => {
  it('renders the component', () => {
    const { container } = render(
      <MemoryRouter>
        <Alerts {...alertsMock} />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
