/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import DeleteRuleModalMock from '../../../../../test/mocks/Rules/components/DeleteModal/DeleteRuleModal.mock';
import { DeleteRuleModal } from './DeleteRuleModal';

describe('<DeleteModal /> spec', () => {
  it('renders the component', () => {
    const tree = render(<DeleteRuleModal {...DeleteRuleModalMock} />);
    expect(tree).toMatchSnapshot();
  });
});
