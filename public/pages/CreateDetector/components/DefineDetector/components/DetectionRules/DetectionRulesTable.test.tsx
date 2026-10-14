/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { expect } from '@jest/globals';
import { DetectionRulesTable } from './DetectionRulesTable';
import { RuleItem } from './types/interfaces';

const createRuleItem = (id: string, library: string, active: boolean): RuleItem =>
  ({
    id,
    name: `rule-${id}`,
    severity: 'high',
    logType: 'windows',
    library,
    description: `description-${id}`,
    active,
    ruleInfo: {} as any,
  }) as RuleItem;

const getToggleAllSwitch = (container: HTMLElement) =>
  container.querySelector('thead [role="switch"]') as HTMLButtonElement;

const applySearch = (container: HTMLElement, queryText: string) => {
  const searchInput = container.querySelector('input[type="search"]') as HTMLInputElement;
  fireEvent.change(searchInput, { target: { value: queryText } });
  fireEvent.keyUp(searchInput, { key: 'Enter', keyCode: 13 });
};

describe('<DetectionRulesTable /> toggle all', () => {
  const ruleItems = [
    createRuleItem('standard-1', 'Standard', true),
    createRuleItem('standard-2', 'Standard', true),
    createRuleItem('custom-1', 'Custom', true),
  ];

  it('toggles all rules when no filter is applied', () => {
    const onAllRulesToggled = jest.fn();
    const { container } = render(
      <DetectionRulesTable
        ruleItems={[...ruleItems]}
        onAllRulesToggled={onAllRulesToggled}
        onRuleActivationToggle={jest.fn()}
      />
    );

    const toggleAll = getToggleAllSwitch(container);
    expect(toggleAll.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggleAll);

    expect(onAllRulesToggled).toHaveBeenCalledTimes(1);
    const [enabled, toggledItems] = onAllRulesToggled.mock.calls[0];
    expect(enabled).toBe(false);
    expect(toggledItems.map((item: RuleItem) => item.id).sort()).toEqual(
      ['custom-1', 'standard-1', 'standard-2'].sort()
    );
  });

  it('only toggles the rules matching the active filter', () => {
    const onAllRulesToggled = jest.fn();
    const { container } = render(
      <DetectionRulesTable
        ruleItems={[...ruleItems]}
        onAllRulesToggled={onAllRulesToggled}
        onRuleActivationToggle={jest.fn()}
      />
    );

    applySearch(container, 'library:Custom');
    fireEvent.click(getToggleAllSwitch(container));

    expect(onAllRulesToggled).toHaveBeenCalledTimes(1);
    const [enabled, toggledItems] = onAllRulesToggled.mock.calls[0];
    expect(enabled).toBe(false);
    expect(toggledItems.map((item: RuleItem) => item.id)).toEqual(['custom-1']);
  });

  it('reflects the state of the filtered rules in the toggle all switch', () => {
    const { container } = render(
      <DetectionRulesTable
        ruleItems={[
          createRuleItem('standard-1', 'Standard', false),
          createRuleItem('custom-1', 'Custom', true),
        ]}
        onAllRulesToggled={jest.fn()}
        onRuleActivationToggle={jest.fn()}
      />
    );

    expect(getToggleAllSwitch(container).getAttribute('aria-checked')).toBe('false');
    applySearch(container, 'library:Custom');
    expect(getToggleAllSwitch(container).getAttribute('aria-checked')).toBe('true');
  });

  it('shows the toggle all switch as off when the filter matches no rules', () => {
    const { container } = render(
      <DetectionRulesTable
        ruleItems={[...ruleItems]}
        onAllRulesToggled={jest.fn()}
        onRuleActivationToggle={jest.fn()}
      />
    );

    applySearch(container, 'library:Nonexistent');
    expect(getToggleAllSwitch(container).getAttribute('aria-checked')).toBe('false');
  });
});

describe('<DetectionRulesTable /> toggle all after a free text search', () => {
  const ruleItems: RuleItem[] = [
    {
      ...createRuleItem('rule-1', 'Standard', true),
      name: 'Suspicious PowerShell download',
      description: 'Detects a download cradle',
    },
    {
      ...createRuleItem('rule-2', 'Standard', true),
      name: 'Encoded PowerShell command',
      description: 'Detects lateral movement',
    },
    {
      ...createRuleItem('rule-3', 'Custom', true),
      name: 'New service installed',
      description: 'Detects a new service',
      logType: 'cloudtrail',
    },
    {
      ...createRuleItem('hidden-rule-4', 'Custom', true),
      name: 'Scheduled task created',
      description: 'Detects persistence',
    },
  ];

  // The ids of the rules the table shows, from the rule names in its rows
  const getRenderedRuleIds = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('tbody tr'))
      .map((row) =>
        ruleItems.find((item) =>
          Array.from(row.querySelectorAll('.euiTableCellContent')).some(
            (cell) => cell.textContent?.trim() === item.name
          )
        )
      )
      .filter((item): item is RuleItem => !!item)
      .map((item) => item.id)
      .sort();

  it.each([
    ['a word only in some rule names', 'powershell', ['rule-1', 'rule-2']],
    ['a word only in a description', 'lateral', ['rule-2']],
    ['a word in a name and a description', 'service', ['rule-3']],
    ['a log type', 'cloudtrail', ['rule-3']],
    ['a word only in a field without a column', 'hidden', ['hidden-rule-4']],
    ['words of different rules', 'powershell persistence', []],
    ['a word in no rule', 'nonexistent', []],
  ])('toggles exactly the rules the table shows for %s', (_, queryText, expectedIds) => {
    const onAllRulesToggled = jest.fn();
    const { container } = render(
      <DetectionRulesTable
        ruleItems={[...ruleItems]}
        onAllRulesToggled={onAllRulesToggled}
        onRuleActivationToggle={jest.fn()}
      />
    );
    expect(getRenderedRuleIds(container)).toHaveLength(ruleItems.length);

    applySearch(container, queryText);
    const renderedIds = getRenderedRuleIds(container);
    expect(renderedIds).toEqual(expectedIds);
    fireEvent.click(getToggleAllSwitch(container));

    expect(onAllRulesToggled).toHaveBeenCalledTimes(1);
    const [enabled, toggledItems] = onAllRulesToggled.mock.calls[0];
    // The switch is only on if the table shows rules and all of them are active.
    expect(enabled).toBe(renderedIds.length === 0);
    expect(toggledItems.map((item: RuleItem) => item.id).sort()).toEqual(renderedIds);
  });
});
