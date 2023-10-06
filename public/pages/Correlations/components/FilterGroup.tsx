/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFilterButton,
  EuiFilterGroup,
  EuiFilterSelectItem,
  EuiPopover,
  EuiPopoverTitle,
  EuiFieldSearch,
  FilterChecked,
  EuiPopoverFooter,
  EuiButtonEmpty,
} from '@elastic/eui';

export type FilterItem = {
  name: string | React.ReactNode;
  id: string;
  visible: boolean;
  childOptionIds?: Set<string>;
  checked?: FilterChecked;
};
export interface LogTypeFilterGroupProps {
  groupName: string;
  items: FilterItem[];
  hasGroupOptions?: boolean;
  hasFooter?: boolean;
  setItems: (items: FilterItem[]) => void;
}

export const FilterGroup: React.FC<LogTypeFilterGroupProps> = ({
  groupName,
  items,
  hasGroupOptions,
  hasFooter,
  setItems,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showActiveFilters, setShowActiveFilters] = useState(false);

  const onButtonClick = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  function toggleItem(index: number) {
    if (!items[index]) {
      return;
    }

    const newItems = [...items];

    switch (newItems[index].checked) {
      case 'on':
        newItems[index] = {
          ...newItems[index],
          checked: undefined,
        };
        break;

      default:
        newItems[index] = {
          ...newItems[index],
          checked: 'on',
        };
    }
    const childIds = newItems[index].childOptionIds;
    if (childIds) {
      newItems.forEach((item) => {
        if (childIds.has(item.id)) {
          item.checked = newItems[index].checked;
        }
      });
    }

    setItems(newItems);
    setShowActiveFilters(true);
  }

  function toggleAll(state: 'on' | undefined) {
    const newItems = items.map((item) => ({
      ...item,
      checked: state,
    }));

    setItems(newItems);
    setShowActiveFilters(!!state);
  }

  function search(term: string) {
    const newItems = [...items];
    term = term.toLowerCase();
    items.forEach((item) => {
      item.visible = item.id.toLowerCase().includes(term);
    });
    setItems(newItems);
    setShowActiveFilters(true);
  }

  const button = (
    <EuiFilterButton
      iconType="arrowDown"
      onClick={onButtonClick}
      isSelected={isPopoverOpen}
      hasActiveFilters={showActiveFilters && !!items.find((item) => item.checked === 'on')}
      numActiveFilters={
        showActiveFilters ? items.filter((item) => item.checked === 'on').length : undefined
      }
    >
      {groupName}
    </EuiFilterButton>
  );

  return (
    <EuiFilterGroup>
      <EuiPopover
        id="popoverExampleMultiSelect"
        button={button}
        isOpen={isPopoverOpen}
        closePopover={closePopover}
        panelPaddingSize="none"
      >
        <EuiPopoverTitle paddingSize="s">
          <EuiFieldSearch compressed onSearch={search} />
        </EuiPopoverTitle>
        <div
          className="ouiFilterSelect__items"
          style={hasFooter ? { maxHeight: 400, overflow: 'scroll' } : undefined}
        >
          {items.map((item, index) => {
            const itemStyle: any = {};
            itemStyle['paddingLeft'] =
              hasGroupOptions && !item.childOptionIds ? 20 : itemStyle['paddingLeft'];
            itemStyle['display'] = !item.visible ? 'none' : itemStyle['display'];

            return (
              <EuiFilterSelectItem
                checked={item.checked}
                key={index}
                onClick={() => toggleItem(index)}
                showIcons={true}
                style={itemStyle}
              >
                {item.name}
              </EuiFilterSelectItem>
            );
          })}
        </div>
        {hasFooter && (
          <EuiPopoverFooter>
            <div>
              <EuiButtonEmpty onClick={() => toggleAll('on')}>Select all</EuiButtonEmpty>
              <EuiButtonEmpty onClick={() => toggleAll(undefined)}>Deselect all</EuiButtonEmpty>
            </div>
          </EuiPopoverFooter>
        )}
      </EuiPopover>
    </EuiFilterGroup>
  );
};
