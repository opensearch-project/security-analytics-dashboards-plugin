/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { mount } from 'enzyme';
import { expect } from '@jest/globals';
import { RecentThreatIntelFindingsWidget } from './RecentThreatIntelFindingsWidget';
import { ThreatIntelFinding } from '../../../../../types';
import { setupCoreStart } from '../../../../../test/utils/helpers';

const finding = (id: string, iocType: string, iocValue: string, timestamp: number) =>
  ({
    id,
    related_doc_ids: [`${id}:doc-index`],
    ioc_feed_ids: [
      { ioc_id: `${id}-ioc`, feed_id: 'feed-1', feed_name: 'Test feed', index: 'ioc-index' },
    ],
    monitor_id: 'monitor-1',
    monitor_name: 'Threat intel monitor',
    ioc_value: iocValue,
    ioc_type: iocType,
    timestamp,
    execution_id: 'execution-1',
  } as ThreatIntelFinding);

describe('<RecentThreatIntelFindingsWidget /> spec', () => {
  beforeAll(() => {
    setupCoreStart();
  });

  it('renders the indicator type column for every IOC type without throwing', () => {
    const items = [
      finding('f1', 'ipv4-addr', '203.0.113.10', 1700000000000),
      finding('f2', 'domain-name', 'malicious.example', 1700000001000),
      finding('f3', 'hashes', 'd41d8cd98f00b204e9800998ecf8427e', 1700000002000),
      // A type outside the built-in set (custom IOC schema) must render too.
      finding('f4', 'custom-type', 'value', 1700000003000),
    ];

    const wrapper = mount(<RecentThreatIntelFindingsWidget items={items} />);
    const text = wrapper.text();

    expect(text).toContain('Ipv4-addr');
    expect(text).toContain('Domain-name');
    expect(text).toContain('Hashes');
    expect(text).toContain('Custom-type');
    expect(text).toContain('203.0.113.10');
  });

  it('renders the empty prompt when there are no findings', () => {
    const wrapper = mount(<RecentThreatIntelFindingsWidget items={[]} />);
    expect(wrapper.text()).toContain('No recent findings.');
  });
});
