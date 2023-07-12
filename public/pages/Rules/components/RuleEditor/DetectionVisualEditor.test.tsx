/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { DetectionVisualEditor } from './DetectionVisualEditor';
import DetectionVisualEditorMock from '../../../../../test/mocks/Rules/components/RuleEditor/DetectionVisualEditor.mock';

describe('<SelectionExpField /> spec', () => {
  it('renders the component', () => {
    const tree = render(<DetectionVisualEditor {...DetectionVisualEditorMock} />);
    expect(tree).toMatchSnapshot();
  });
});
