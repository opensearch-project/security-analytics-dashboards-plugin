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
      name: 'Rule sverity',
    },
    {
      field: 'logType',
      name: 'Log type',
    },
    {
      field: 'library',
      name: 'Library',
    },
    {
      field: 'description',
      name: 'Description',
    },
  ];

  if (onActivationToggle) {
    columns.unshift({
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
      width: '50px',
    });
  }

  return columns;
};
