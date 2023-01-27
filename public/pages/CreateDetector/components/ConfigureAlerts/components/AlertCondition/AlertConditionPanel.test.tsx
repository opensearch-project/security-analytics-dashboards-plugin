/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../../../models/CreateDetector/components/ConfigureAlerts/components/AlertCondition/AlertConditionPanel.mock';
import { expect } from '@jest/globals';
import AlertConditionPanel from './AlertConditionPanel';

describe('<AlertConditionPanel /> spec', () => {
  it('renders the component', () => {
    const view = render(<AlertConditionPanel {...props} />);
    expect(view).toMatchSnapshot();
  });
});
