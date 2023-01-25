/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../models/Detectors/components/FieldMappingsView/FieldMappingsView.mock';
import { expect } from '@jest/globals';
import { FieldMappingsView } from './FieldMappingsView';

describe('<FieldMappingsView /> spec', () => {
  it('renders the component', () => {
    const view = render(<FieldMappingsView {...props} />);
    expect(view).toMatchSnapshot();
  });
});
