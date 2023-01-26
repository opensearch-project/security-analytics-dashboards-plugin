/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../models/Detectors/components/UpdateDetectorBasicDetails/UpdateDetectorBasicDetails.mock';
import { expect } from '@jest/globals';
import { UpdateDetectorBasicDetails } from './UpdateBasicDetails';

describe('<UpdateDetectorBasicDetails /> spec', () => {
  it('renders the component', () => {
    const view = render(<UpdateDetectorBasicDetails {...props} />);
    expect(view).toMatchSnapshot();
  });
});
