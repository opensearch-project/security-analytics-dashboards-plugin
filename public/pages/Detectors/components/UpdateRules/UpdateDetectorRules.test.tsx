/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../models/Detectors/components/UpdateDetectorRules/UpdateDetectorRules.mock';
import { expect } from '@jest/globals';
import { UpdateDetectorRules } from './UpdateRules';

describe('<UpdateDetectorRules /> spec', () => {
  it('renders the component', () => {
    const view = render(<UpdateDetectorRules {...props} />);
    expect(view).toMatchSnapshot();
  });
});
