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
