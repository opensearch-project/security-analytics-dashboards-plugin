/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { AlertFlyout } from './AlertFlyout';
import alertFlyoutMock from '../../../../../test/mocks/Alerts/components/AlertFlyout/AlertFlyout.mock';

describe('<AlertFlyout /> spec', () => {
  it('renders the component', () => {
    const { container } = render(<AlertFlyout {...alertFlyoutMock} />);
    expect(container).toMatchSnapshot();
  });
});
