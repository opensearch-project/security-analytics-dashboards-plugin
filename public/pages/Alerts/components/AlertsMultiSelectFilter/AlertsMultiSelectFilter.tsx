/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFilterSelectItem, EuiPopover, EuiSmallFilterButton } from '@elastic/eui';

export interface AlertsMultiSelectFilterProps {
  name: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  'data-test-subj'?: string;
}

/**
 * Filter button with a popover to select any number of the given options.
 * The selected values are reported in the order of the options.
 */
export const AlertsMultiSelectFilter: React.FC<AlertsMultiSelectFilterProps> = ({
  name,
  options,
  selected,
  onChange,
  'data-test-subj': dataTestSubj,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const toggleOption = (value: string) => {
    const nextSelected = selected.includes(value)
      ? selected.filter((selectedValue) => selectedValue !== value)
      : [...selected, value];
    onChange(
      options.map((option) => option.value).filter((option) => nextSelected.includes(option))
    );
  };

  const button = (
    <EuiSmallFilterButton
      iconType="arrowDown"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      isSelected={isPopoverOpen}
      hasActiveFilters={selected.length > 0}
      numFilters={options.length}
      numActiveFilters={selected.length || undefined}
      data-test-subj={dataTestSubj}
    >
      {name}
    </EuiSmallFilterButton>
  );

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize="none"
    >
      <div className="euiFilterSelect__items">
        {options.map(({ value, label }) => (
          <EuiFilterSelectItem
            key={value}
            checked={selected.includes(value) ? 'on' : undefined}
            onClick={() => toggleOption(value)}
            data-test-subj={dataTestSubj ? `${dataTestSubj}-option-${value}` : undefined}
          >
            {label}
          </EuiFilterSelectItem>
        ))}
      </div>
    </EuiPopover>
  );
};
