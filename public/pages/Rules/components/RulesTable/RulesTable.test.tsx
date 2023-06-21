/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RulesTable } from './RulesTable';
import RulesTableMock from '../../../../../test/mocks/Rules/components/RulesTable/RulesTable.mock';

describe('<RulesTable /> spec', () => {
  it('renders the component', () => {
    const tree = render(<RulesTable {...RulesTableMock} />);
    expect(tree).toMatchSnapshot();
  });
});
