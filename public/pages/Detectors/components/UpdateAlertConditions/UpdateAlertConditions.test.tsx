/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../../test/mocks/Detectors/components/UpdateAlertConditions/UpdateAlertConditions.mock';
import { expect } from '@jest/globals';
import UpdateAlertConditions from './UpdateAlertConditions';

describe('<UpdateAlertConditions /> spec', () => {
  it('renders the component', () => {
    const view = render(<UpdateAlertConditions {...props} />);
    expect(view).toMatchSnapshot();
  });
});
