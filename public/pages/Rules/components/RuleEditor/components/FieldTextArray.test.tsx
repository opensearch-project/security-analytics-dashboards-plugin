/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { FieldTextArray } from './FieldTextArray';
import FieldTextArrayMock from '../../../../../../test/mocks/Rules/components/RuleEditor/components/FieldTextArray.mock';

describe('<FieldTextArray /> spec', () => {
  it('renders the component', () => {
    const tree = render(<FieldTextArray {...FieldTextArrayMock} />);
    expect(tree).toMatchSnapshot();
  });
});
