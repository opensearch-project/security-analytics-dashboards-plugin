/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import Alerts from "./Alerts";

describe('<Alerts /> spec', () => {
  it('renders the component', () => {
    const { container } = render(<Alerts />);
console.log('c', container);
    // expect(container).toMatchSnapshot();
  });
});
