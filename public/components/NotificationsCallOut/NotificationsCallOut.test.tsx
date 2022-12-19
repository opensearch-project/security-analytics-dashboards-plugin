/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { NotificationsCallOut } from './NotificationsCallOut';

describe('<NotificationsCallOut /> spec', () => {
  it('renders the component', () => {
    const tree = render(<NotificationsCallOut />);
    expect(tree).toMatchSnapshot();
  });
});
