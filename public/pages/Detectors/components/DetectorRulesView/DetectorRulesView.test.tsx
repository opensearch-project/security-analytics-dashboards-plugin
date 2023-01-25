/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../models/Detectors/components/DetectorRulesView/DetectorRulesView.mock';
import { expect } from '@jest/globals';
import { DetectorRulesView } from './DetectorRulesView';
jest.mock('../../../Rules/models/RulesViewModelActor.ts');

describe('<DetectorRulesView /> spec', () => {
  it('renders the component', () => {
    const view = render(<DetectorRulesView {...props} />);
    expect(view).toMatchSnapshot();
  });
});
