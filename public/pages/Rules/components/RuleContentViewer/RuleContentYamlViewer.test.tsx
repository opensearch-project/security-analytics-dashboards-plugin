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
        rule={{
          id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
          category: 'windows',
          title: 'Testing rule',
          description: 'Testing Description',
          status: 'experimental',
          author: 'Bhabesh Raj',
          references: [
            {
              value: 'https://securelist.com/operation-tunnelsnake-and-moriya-rootkit/101831',
            },
          ],
          tags: [
            {
              value: 'attack.persistence',
            },
            {
              value: 'attack.privilege_escalation',
            },
            {
              value: 'attack.t1543.003',
            },
          ],
          log_source: {},
          detection:
            'selection:\n  Provider_Name: Service Control Manager\n  EventID: 7045\n  ServiceName: ZzNetSvc\ncondition: selection\n',
          level: 'high',
          false_positives: [
            {
              value: 'Unknown',
            },
          ],
        }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
