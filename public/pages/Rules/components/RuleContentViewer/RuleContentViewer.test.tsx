/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RuleContentViewer } from './RuleContentViewer';

describe('<RuleContentViewer /> spec', () => {
  it('renders the component', () => {
    const { container } = render(
      <RuleContentViewer
        rule={
          {
            prePackaged: false,
            _source: {
              category: 'dns',
              title: 'My Rule',
              log_source: 'dns',
              description: 'My Rule',
              references: [],
              tags: [],
              level: 'high',
              false_positives: [],
              author: 'aleksandar',
              status: 'stable',
              last_update_time: '2022-11-22T23:00:00.000Z',
              queries: [
                {
                  value: 'EventID: 4800',
                },
              ],
              rule:
                'id: 25b9c01c-350d-4b95-bed1-836d04a4f324\ntitle: My Rule\ndescription: My Rule\nstatus: stable\nauthor: aleksandar\ndate: 2022/11/23\nmodified: 2022/11/23\nlogsource:\n  category: dns\nlevel: high\ndetection:\n  selection:\n    EventID: 4800\n  condition: selection\n',
              detection: 'selection:\n  EventID: 4800\ncondition: selection\n',
            },
          } as any
        }
      ></RuleContentViewer>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
