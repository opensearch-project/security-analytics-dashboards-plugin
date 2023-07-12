/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { SelectionExpField } from './SelectionExpField';
import SelectionExpFieldMock from '../../../../../../test/mocks/Rules/components/RuleEditor/components/SelectionExpField.mock';

describe('<SelectionExpField /> spec', () => {
  it('renders the component', () => {
    const tree = render(<SelectionExpField {...SelectionExpFieldMock} />);
    expect(tree).toMatchSnapshot();
  });
});
