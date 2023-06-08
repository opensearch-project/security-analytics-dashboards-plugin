/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { FormSubmissionErrorToastNotification } from './FormSubmitionErrorToastNotification';

describe('<FormSubmissionErrorToastNotification /> spec', () => {
  it('renders the component', () => {
    const tree = render(<FormSubmissionErrorToastNotification />);
    expect(tree).toMatchSnapshot();
  });
});
