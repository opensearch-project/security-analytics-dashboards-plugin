/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RuleContentYamlViewer } from './RuleContentYamlViewer';

describe('<RuleContentYamlViewer /> spec', () => {
  it('renders the component', () => {
    const { container } = render(
      <RuleContentYamlViewer
        ruleYaml={
          'id: 25b9c01c-350d-4b95-bed1-836d04a4f324\ntitle: My Rule\ndescription: My Rule\nstatus: stable\nauthor: aleksandar\ndate: 2022/11/23\nmodified: 2022/11/23\nlogsource:\n  category: dns\nlevel: high\ndetection:\n  selection:\n    EventID: 4800\n  condition: selection\n'
        }
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
