/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiLink, EuiSwitch } from '@elastic/eui';
import React, { ReactNode } from 'react';
import { RuleItem } from '../types/interfaces';

export type ActiveToggleOnChangeEvent = React.BaseSyntheticEvent<
  React.MouseEvent<HTMLButtonElement>,
  HTMLButtonElement,
  EventTarget & { checked: boolean }
>;

export const getRulesColumns = (
  allEnabled: boolean,
  onAllRulesToggled?: (enabled: boolean) => void,
  onActivationToggle?: (item: RuleItem, active: boolean) => void
): EuiBasicTableColumn<RuleItem>[] => {
  const columns: EuiBasicTableColumn<RuleItem>[] = [
    {
      field: 'name',
      name: 'Rule name',
      render: (ruleName: string, item: RuleItem): ReactNode => (
        <EuiLink style={{ marginLeft: 10 }}>{ruleName}</EuiLink>
      ),
    },
    {
      field: 'severity',
      name: 'Rule severity',
    },
    {
      field: 'logType',
      name: 'Log type',
    },
    {
      field: 'library',
      name: 'Source',
    },
    {
      field: 'description',
      name: 'Description',
    },
  ];

  if (onActivationToggle) {
    columns.unshift({
      name: onAllRulesToggled ? (
        <EuiSwitch
          checked={allEnabled}
          onChange={(event: ActiveToggleOnChangeEvent) => {
            onAllRulesToggled(!allEnabled);
          }}
          label={''}
          showLabel={false}
        />
      ) : undefined,
      render: (item: RuleItem) => {
        return (
          <EuiSwitch
            checked={item.active}
            onChange={(event: ActiveToggleOnChangeEvent) =>
              onActivationToggle(item, event.target.checked)
            }
            label={''}
            showLabel={false}
          />
        );
      },
      width: '60px',
    });
  }

  return columns;
};
