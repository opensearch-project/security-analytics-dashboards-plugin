/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiLink, EuiCompressedSwitch } from '@elastic/eui';
import { capitalizeFirstLetter } from '../../../../../../../utils/helpers';
import React, { ReactNode } from 'react';
import { RuleItem } from '../types/interfaces';
import { getLogTypeLabel } from '../../../../../../LogTypes/utils/helpers';

export type ActiveToggleOnChangeEvent = React.BaseSyntheticEvent<
  React.MouseEvent<HTMLButtonElement>,
  HTMLButtonElement,
  EventTarget & { checked: boolean }
>;

export const getRulesColumns = (
  allEnabled: boolean,
  onAllRulesToggled?: (enabled: boolean) => void,
  onActivationToggle?: (item: RuleItem, active: boolean) => void,
  onRuleDetails?: (item: RuleItem) => void
): EuiBasicTableColumn<RuleItem>[] => {
  const columns: EuiBasicTableColumn<RuleItem>[] = [
    {
      field: 'name',
      name: 'Rule name',
      render: (ruleName: string, item: RuleItem): ReactNode => {
        const onRuleNameClicker = () => {
          if (onRuleDetails) {
            onRuleDetails(item);
          }
        };
        return (
          <EuiLink style={{ marginLeft: 10 }} onClick={onRuleNameClicker}>
            {ruleName}
          </EuiLink>
        );
      },
      width: '30%',
      sortable: true,
    },
    {
      field: 'severity',
      name: 'Rule severity',
      width: '10%',
      sortable: true,
      render: (severity: string) => capitalizeFirstLetter(severity),
    },
    {
      field: 'logType',
      name: 'Log type',
      width: '10%',
      sortable: true,
      render: (logType: string) => getLogTypeLabel(logType),
    },
    {
      field: 'library',
      name: 'Source',
      width: '10%',
      render: (library: string) => capitalizeFirstLetter(library),
    },
    {
      field: 'description',
      name: 'Description',
    },
  ];

  if (onActivationToggle) {
    columns.unshift({
      name: onAllRulesToggled ? (
        <EuiCompressedSwitch
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
          <EuiCompressedSwitch
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
