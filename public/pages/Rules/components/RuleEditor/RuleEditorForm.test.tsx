/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RuleEditorForm } from './RuleEditorForm';
import RuleEditorFormMock from '../../../../../test/mocks/Rules/components/RuleEditor/RuleEditorForm.mock';

describe('<RuleEditorForm /> spec', () => {
  it('renders the component', () => {
    const tree = render(<RuleEditorForm {...RuleEditorFormMock} />);
    expect(tree).toMatchSnapshot();
  });
});
