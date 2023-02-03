/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { FormFieldHeader } from './FormFieldHeader';

describe('<FormFieldHeader /> spec', () => {
  it('renders the component', () => {
    const tree = render(<FormFieldHeader headerTitle={'some title'} />);

    expect(tree).toMatchSnapshot();
  });
});
