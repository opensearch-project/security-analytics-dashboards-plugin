/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiSmallFilterButton,
  EuiFilterGroup,
  EuiFilterSelectItem,
  EuiPopover,
  EuiPopoverTitle,
  EuiFieldSearch,
  FilterChecked,
  EuiPopoverFooter,
  EuiButtonGroup,
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

type SelectionToggleOptionIds = 'select_all' | 'deselect_all';

const selectionToggleButtons = [
  {
    id: 'select_all',
    label: 'Select all',
  },
  {
    id: 'deselect_all',
    label: 'Deselect all',
  },
];

export const FilterGroup: React.FC<LogTypeFilterGroupProps> = ({
  groupName,
  items,
  hasGroupOptions,
  hasFooter,
  setItems,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [filterUpdated, setFilterUpdated] = useState(false);
  const [selectionToggleSelectedId, setSelectionToggleSelectedId] = useState<
    SelectionToggleOptionIds
  >('select_all');

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

        // This means, it is not a grouping label,
        // so we need to switch off the grouping label too if it exists
        if (!newItems[index].childOptionIds) {
          for (let i = index - 1; i >= 0; i--) {
            // Found the parent grouping label
            if (newItems[i].childOptionIds) {
              newItems[i].checked = undefined;
              break;
            }
          }
        }
        break;

      default:
        newItems[index] = {
          ...newItems[index],
          checked: 'on',
        };

        // This means, it is not a grouping label,
        // so we need to switch ON the grouping label if all children are checked
        if (!newItems[index].childOptionIds) {
          let i: number;
          for (i = index - 1; i >= 0; i--) {
            const childIds = newItems[i].childOptionIds;
            // Found the parent grouping label
            if (childIds) {
              let allChecked = true;
              newItems.forEach((item) => {
                if (childIds.has(item.id)) {
                  allChecked = allChecked && !!item.checked;
                }
              });
              newItems[i].checked = allChecked ? 'on' : undefined;
              break;
            }
          }
        }
    }

    // If a grouping label is toggled, toggle all its children
    const childIds = newItems[index].childOptionIds;
    if (childIds) {
      newItems.forEach((item) => {
        if (childIds.has(item.id)) {
          item.checked = newItems[index].checked;
        }
      });
    }

    setItems(newItems);
    setFilterUpdated(!newItems.every((item) => item.checked));
  }

  function onSelectionToggleChange(optionId: string) {
    setSelectionToggleSelectedId(optionId as SelectionToggleOptionIds);
    toggleAll(optionId === 'select_all' ? 'on' : undefined);
  }

  function toggleAll(state: 'on' | undefined) {
    const newItems = items.map((item) => ({
      ...item,
      checked: state,
    }));

    setItems(newItems);
    setFilterUpdated(!state);
  }

  function search(term: string) {
    const newItems = [...items];
    term = term.toLowerCase();
    items.forEach((item) => {
      item.visible = item.id.toLowerCase().includes(term);
    });
    setItems(newItems);
    setFilterUpdated(true);
  }

  const numActiveFilters = items.filter((item) => !item.childOptionIds && item.checked === 'on')
    .length;
  const button = (
    <EuiSmallFilterButton
      iconType="arrowDown"
      onClick={onButtonClick}
      isSelected={isPopoverOpen}
      hasActiveFilters={filterUpdated}
      numActiveFilters={numActiveFilters > 0 ? numActiveFilters : undefined}
    >
      {groupName}
    </EuiSmallFilterButton>
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
          <EuiFieldSearch compressed onSearch={search} isClearable={true} />
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
            <EuiButtonGroup
              legend="All toptions selection toggle group"
              options={selectionToggleButtons}
              idSelected={selectionToggleSelectedId}
              onChange={onSelectionToggleChange}
            />
          </EuiPopoverFooter>
        )}
      </EuiPopover>
    </EuiFilterGroup>
  );
};
