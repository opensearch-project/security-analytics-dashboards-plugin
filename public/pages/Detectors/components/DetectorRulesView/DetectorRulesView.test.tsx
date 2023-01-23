/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../models/Detectors/components/DetectorRulesView/DetectorRulesViewMock.test';
import { expect } from '@jest/globals';
import { DetectorRulesView } from './DetectorRulesView';

describe('<DetectorRulesView /> spec', () => {
  it('renders the component', () => {
    const view = render(<DetectorRulesView {...props} />);
    expect(view).toMatchSnapshot();
  });
});
