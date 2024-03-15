/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { YamlRuleEditorComponent } from './YamlRuleEditorComponent';
import { DEFAULT_RULE_UUID } from '../../../../../../../common/constants';

describe('<YamlRuleEditorComponent /> spec', () => {
  it('renders the component', () => {
    const { container } = render(
      <YamlRuleEditorComponent
        change={() => {}}
        rule={{
          id: DEFAULT_RULE_UUID,
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
        isInvalid={false}
      >
        <div>Testing YamlRuleEditor</div>
      </YamlRuleEditorComponent>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders the component - invalid state', () => {
    const { container } = render(
      <YamlRuleEditorComponent
        change={() => {}}
        rule={{
          id: DEFAULT_RULE_UUID,
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
        isInvalid={true}
        errors={['Validation error message']}
      >
        <div>Testing YamlRuleEditor</div>
      </YamlRuleEditorComponent>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
