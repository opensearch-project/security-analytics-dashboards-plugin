/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import AlertConditionPanel from './AlertConditionPanel';
import alertConditionPanelMock from '../../../../../../../test/mocks/CreateDetector/components/ConfigureAlerts/components/AlertCondition/AlertConditionPanel.mock';

describe('<AlertConditionPanel /> spec', () => {
  it('renders the component', () => {
    const tree = render(<AlertConditionPanel {...alertConditionPanelMock} />);
    expect(tree).toMatchSnapshot();
  });
});
