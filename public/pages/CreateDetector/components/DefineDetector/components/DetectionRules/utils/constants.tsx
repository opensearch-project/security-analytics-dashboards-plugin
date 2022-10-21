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
  onActivationToggle: (item: RuleItem, active: boolean) => void
): EuiBasicTableColumn<RuleItem>[] => [
  {
    field: 'ruleName',
    name: 'Rule name',
    render: (ruleName: string, item: RuleItem): ReactNode => (
      <>
        <EuiSwitch
          checked={item.active}
          onChange={(event: ActiveToggleOnChangeEvent) =>
            onActivationToggle(item, event.target.checked)
          }
          label={''}
          showLabel={false}
        />
        <EuiLink onClick={() => alert('opening rule details')} style={{ marginLeft: 10 }}>
          {ruleName}
        </EuiLink>
      </>
    ),
  },
  {
    field: 'ruleType',
    name: 'Rule Type',
  },
  {
    field: 'description',
    name: 'Description',
  },
];
