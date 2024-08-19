/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSmallButtonIcon, EuiLink, EuiToolTip } from '@elastic/eui';
import { LogType } from '../../../../types';
import { capitalize, startCase } from 'lodash';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { ruleSource } from '../../Rules/utils/constants';
import { DEFAULT_EMPTY_DATA, logTypeCategories } from '../../../utils/constants';
import { logTypeLabels } from './constants';

export const getLogTypesTableColumns = (
  showDetails: (id: string) => void,
  deleteLogType: (logType: LogType) => void
) => [
  {
    field: 'name',
    name: 'Name',
    sortable: true,
    render: (name: string, item: LogType) => {
      return <EuiLink onClick={() => showDetails(item.id)}>{getLogTypeLabel(name)}</EuiLink>;
    },
  },
  {
    field: 'description',
    name: 'Description',
    truncateText: false,
  },
  {
    field: 'category',
    name: 'Category',
    truncateText: false,
  },
  {
    field: 'source',
    name: 'Source',
    render: (source: string) => capitalize(source),
  },
  {
    name: 'Actions',
    actions: [
      {
        render: (item: LogType) => {
          return (
            <EuiToolTip content="Delete">
              <EuiSmallButtonIcon
                aria-label={'Delete log type'}
                iconType={'trash'}
                color="danger"
                onClick={() => deleteLogType(item)}
              />
            </EuiToolTip>
          );
        },
      },
    ],
  },
];

export const getLogTypesTableSearchConfig = (): Search => {
  return {
    box: {
      placeholder: 'Search log types',
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'category',
        name: 'Category',
        multiSelect: 'or',
        options: logTypeCategories.map((category) => ({
          value: category,
        })),
      },
      {
        type: 'field_value_selection',
        field: 'source',
        name: 'Source',
        multiSelect: 'or',
        options: ruleSource.map((source: string) => ({
          value: source,
        })),
      },
    ],
  };
};

export const getLogTypeLabel = (name: string) => {
  return !name ? DEFAULT_EMPTY_DATA : logTypeLabels[name.toLowerCase()] || startCase(name);
};
