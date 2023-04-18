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
} from '@elastic/eui';

export type FilterItem = { name: string | React.ReactNode; id: string; checked?: FilterChecked };
export interface LogTypeFilterGroupProps {
  groupName: string;
  items: FilterItem[];
  setItems: (items: FilterItem[]) => void;
}

export const FilterGroup: React.FC<LogTypeFilterGroupProps> = ({ groupName, items, setItems }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  function updateItem(index: number) {
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

    setItems(newItems);
  }

  const button = (
    <EuiFilterButton
      iconType="arrowDown"
      onClick={onButtonClick}
      isSelected={isPopoverOpen}
      numFilters={items.length}
      hasActiveFilters={!!items.find((item) => item.checked === 'on')}
      numActiveFilters={items.filter((item) => item.checked === 'on').length}
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
          <EuiFieldSearch compressed />
        </EuiPopoverTitle>
        <div className="ouiFilterSelect__items">
          {items.map((item, index) => (
            <EuiFilterSelectItem
              checked={item.checked}
              key={index}
              onClick={() => updateItem(index)}
              showIcons={true}
            >
              {item.name}
            </EuiFilterSelectItem>
          ))}
        </div>
      </EuiPopover>
    </EuiFilterGroup>
  );
};
