/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RuleEditorContainer } from './RuleEditorContainer';
import RuleEditorContainerMock from '../../../../../test/mocks/Rules/components/RuleEditor/RuleEditorContainer.mock';

describe('<RuleEditorContainer /> spec', () => {
  it('renders the component', () => {
    const tree = render(<RuleEditorContainer {...RuleEditorContainerMock} />);
    expect(tree).toMatchSnapshot();
  });
});
