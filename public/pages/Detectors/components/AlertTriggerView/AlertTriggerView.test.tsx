/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { AlertTriggerView } from './AlertTriggerView';
import props from '../../../../../test/mocks/Detectors/components/AlertTriggerView/AlertTriggerView.mock';
import { expect } from '@jest/globals';

describe('<AlertTriggerView /> spec', () => {
  it('renders the component', () => {
    const view = render(<AlertTriggerView {...props} />);
    expect(view).toMatchSnapshot();
  });
});
