/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { DetectorBasicDetailsView } from './DetectorBasicDetailsView';
import props from '../../../../models/Detectors/components/DetectorBasicDetailsView/DetectorBasicDetailsView.mock';
import { expect } from '@jest/globals';

describe('<DetectorBasicDetailsView /> spec', () => {
  it('renders the component', () => {
    const view = render(<DetectorBasicDetailsView {...props} />);
    expect(view).toMatchSnapshot();
  });
});
