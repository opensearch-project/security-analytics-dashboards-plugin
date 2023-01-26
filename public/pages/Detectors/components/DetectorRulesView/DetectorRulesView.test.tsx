/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../models/Detectors/components/DetectorRulesView/DetectorRulesView.mock';
import { expect } from '@jest/globals';
import { DetectorRulesView } from './DetectorRulesView';
import { act } from 'react-dom/test-utils';

describe('<DetectorRulesView /> spec', () => {
  it('renders the component', async () => {
    let view;
    act(() => {
      view = render(<DetectorRulesView {...props} />);
    });
    expect(view).toMatchSnapshot();
  });
});
